import { ICssValidator } from "../interface/ICssValidator";
import * as vscode from "vscode"
import { CssTagTemplate } from "../interface/ICssTemplate";
import * as cssService from "vscode-css-languageservice"
import { TextDocument } from 'vscode-languageserver-textdocument';
import { createPositions } from "../utils/createPosition";
import { createVscodeDiagnostic } from "../utils/createVscodeDiagnostic";
import { GlobalOffsets } from "../interface/IGlobalOffsets";

export class CssValidator implements ICssValidator{

    private cssTemplateArray: Array<{ cssTemplate: CssTagTemplate }>
    private document: vscode.TextDocument
    private cssLanguageService:cssService.LanguageService
    diagnosticCollection: vscode.Diagnostic[]


    constructor(CssTemplateArray: Array<{ cssTemplate: CssTagTemplate }>,
          document: vscode.TextDocument,
          diagnosticCollection: vscode.Diagnostic[]){

            this.cssTemplateArray = CssTemplateArray;
            this.document = document;
            this.diagnosticCollection = diagnosticCollection;
            this.cssLanguageService = cssService.getCSSLanguageService()
    }

    validate():void{
        for (const singleBlockOfCssTemplate of this.cssTemplateArray){
            this.validateBlockOfCss(singleBlockOfCssTemplate.cssTemplate)
        }
    }

    private validateBlockOfCss(singleBlockOfCssTemplate: CssTagTemplate){
        const virtualDocumentCssLangServ = this.createVirtualDocument(singleBlockOfCssTemplate.content)
                
        const diagnosticCssLangServ = this.createDiagnosticCollForLangServ(virtualDocumentCssLangServ)
        
        for (const singleDiagnostic of diagnosticCssLangServ){
            this.createDiagnostic(singleDiagnostic,singleBlockOfCssTemplate,virtualDocumentCssLangServ)
        }
    }

    private createVirtualDocument(content: string):TextDocument{
        return TextDocument.create( this.document.uri.toString(),'css',this.document.version,content)
    }

    private createDiagnosticCollForLangServ(virtualDocumentCssLangServ: TextDocument):cssService.Diagnostic[]{
        return this.cssLanguageService.doValidation( 
            virtualDocumentCssLangServ,
            this.cssLanguageService.parseStylesheet(
            virtualDocumentCssLangServ))
    }

    private createDiagnostic(singleDiagnostic:cssService.Diagnostic,singleBlockOfCssTemplate:CssTagTemplate,virtualDocumentCssLangServ:cssService.TextDocument){

        const cssSeverity = singleDiagnostic.severity;

        let diagnosticSeverity: vscode.DiagnosticSeverity;

        switch (cssSeverity) {
            case cssService.DiagnosticSeverity.Error:
                diagnosticSeverity = vscode.DiagnosticSeverity.Error;
                break;
            case cssService.DiagnosticSeverity.Warning:
                diagnosticSeverity = vscode.DiagnosticSeverity.Warning;
                break;
            case cssService.DiagnosticSeverity.Information:
                diagnosticSeverity = vscode.DiagnosticSeverity.Information;
                break;
            case cssService.DiagnosticSeverity.Hint:
                diagnosticSeverity = vscode.DiagnosticSeverity.Hint;
                break;
            default:
                diagnosticSeverity = vscode.DiagnosticSeverity.Warning;
                break;
        }

        const globalOffsets = createPositions(
            singleBlockOfCssTemplate.tag,
            singleBlockOfCssTemplate.pos,
            virtualDocumentCssLangServ.offsetAt(
            new vscode.Position( 
                singleDiagnostic.range.start.line, 
                singleDiagnostic.range.start.character
            )
            ),
            virtualDocumentCssLangServ.offsetAt(
            new vscode.Position( 
                singleDiagnostic.range.end.line, 
                singleDiagnostic.range.end.character
            )
            )
        );
        this.addDiagnostic(globalOffsets,singleDiagnostic.message,diagnosticSeverity)
    }

    private addDiagnostic(globalOffsets: GlobalOffsets,message: string, severity: vscode.DiagnosticSeverity){
        this.diagnosticCollection.push(createVscodeDiagnostic(
            globalOffsets.globalStartOffset,
            globalOffsets.globalEndOffset,
            message,
            severity,
            this.document
        ))
    }
}