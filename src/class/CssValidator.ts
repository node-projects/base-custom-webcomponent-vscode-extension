import { ICssValidator } from "../interface/ICssValidator";
import type { TextDocument as TextDocumentVsCode, Diagnostic} from "vscode";
import { Position, DiagnosticSeverity } from "vscode";
import { CssTagTemplate } from "../interface/ICssTemplate";
import type {LanguageService, Diagnostic as CssDiagnostic, TextDocument as TextDocumentCss} from "vscode-css-languageservice"
import { getCSSLanguageService, DiagnosticSeverity as  DiagnosticSeverityCss} from "vscode-css-languageservice"
import { TextDocument } from 'vscode-languageserver-textdocument';
import { createPositions } from "../utils/createPosition";
import { createVscodeDiagnostic } from "../utils/createVscodeDiagnostic";
import { GlobalOffsets } from "../interface/IGlobalOffsets";

export class CssValidator implements ICssValidator{

    private cssTemplateArray: Array<{ cssTemplate: CssTagTemplate }>
    private document: TextDocumentVsCode
    private cssLanguageService:LanguageService
    diagnosticCollection: Diagnostic[]


    constructor(CssTemplateArray: Array<{ cssTemplate: CssTagTemplate }>,
          document: TextDocumentVsCode,
          diagnosticCollection: Diagnostic[]){

            this.cssTemplateArray = CssTemplateArray;
            this.document = document;
            this.diagnosticCollection = diagnosticCollection;
            this.cssLanguageService = getCSSLanguageService()
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

    private createDiagnosticCollForLangServ(virtualDocumentCssLangServ: TextDocument):CssDiagnostic[]{
        return this.cssLanguageService.doValidation( 
            virtualDocumentCssLangServ,
            this.cssLanguageService.parseStylesheet(
            virtualDocumentCssLangServ))
    }

    private createDiagnostic(singleDiagnostic:CssDiagnostic,singleBlockOfCssTemplate:CssTagTemplate,virtualDocumentCssLangServ:TextDocumentCss){

        const cssSeverity = singleDiagnostic.severity;

        let diagnosticSeverity: DiagnosticSeverity;

        switch (cssSeverity) {
            case DiagnosticSeverityCss.Error:
                diagnosticSeverity = DiagnosticSeverity.Error;
                break;
            case DiagnosticSeverityCss.Warning:
                diagnosticSeverity = DiagnosticSeverity.Warning;
                break;
            case DiagnosticSeverityCss.Information:
                diagnosticSeverity = DiagnosticSeverity.Information;
                break;
            case DiagnosticSeverityCss.Hint:
                diagnosticSeverity = DiagnosticSeverity.Hint;
                break;
            default:
                diagnosticSeverity = DiagnosticSeverity.Warning;
                break;
        }

        const globalOffsets = createPositions(
            singleBlockOfCssTemplate.tag,
            singleBlockOfCssTemplate.pos,
            virtualDocumentCssLangServ.offsetAt(
            new Position( 
                singleDiagnostic.range.start.line, 
                singleDiagnostic.range.start.character
            )
            ),
            virtualDocumentCssLangServ.offsetAt(
            new Position( 
                singleDiagnostic.range.end.line, 
                singleDiagnostic.range.end.character
            )
            )
        );
        this.addDiagnostic(globalOffsets,singleDiagnostic.message,diagnosticSeverity)
    }

    private addDiagnostic(globalOffsets: GlobalOffsets,message: string, severity: DiagnosticSeverity){
        this.diagnosticCollection.push(createVscodeDiagnostic(
            globalOffsets.globalStartOffset,
            globalOffsets.globalEndOffset,
            message,
            severity,
            this.document
        ))
    }
}