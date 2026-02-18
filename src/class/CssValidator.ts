import { ICssValidator } from "../interface/ICssValidator";
import * as vscode from "vscode"
import { CssTagTemplate } from "../interface/ICssTemplate";
import * as cssService from "vscode-css-languageservice"
import { TextDocument } from 'vscode-languageserver-textdocument';
import { createPositions } from "../utils/createPosition";
import { createVscodeDiagnostic } from "../utils/createVscodeDiagnostic";


export class CssValidator implements ICssValidator{

    private CssTemplateArray: Array<{ cssTemplate: CssTagTemplate }>
    private document: vscode.TextDocument
    private diagnosticCollection: vscode.Diagnostic[]
    private cssLanguageService:cssService.LanguageService

    constructor(CssTemplateArray: Array<{ cssTemplate: CssTagTemplate }>,
          document: vscode.TextDocument,
          diagnosticCollection: vscode.Diagnostic[],
          cssLanguageService:cssService.LanguageService){

            this.CssTemplateArray = CssTemplateArray;
            this.document = document;
            this.diagnosticCollection = diagnosticCollection;
            this.cssLanguageService = cssLanguageService
          }
    
    validate():void{
            for (const singleBlockOfCssTemplate of this.CssTemplateArray){
            
                  const virtualDocumentCssLangServ = TextDocument.create( 
                    this.document.uri.toString(),
                    'css',
                    this.document.version,
                    singleBlockOfCssTemplate.cssTemplate.content)
                  
                  const diagnostic = this.cssLanguageService.doValidation( 
                    virtualDocumentCssLangServ,
                    this.cssLanguageService.parseStylesheet(
                    virtualDocumentCssLangServ))
                  
                  for (const singleDiagnostic of diagnostic){
                    
                    const diagnosticSeverity = singleDiagnostic.severity!.valueOf as unknown as vscode.DiagnosticSeverity
            
                    const globalOffsets = createPositions(
                      singleBlockOfCssTemplate.cssTemplate.tag,
                      singleBlockOfCssTemplate.cssTemplate.pos,
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
                    this.diagnosticCollection.push(
                      createVscodeDiagnostic(
                        globalOffsets.globalStartOffset,
                        globalOffsets.globalEndOffset,
                        singleDiagnostic.message,
                        diagnosticSeverity,
                        this.document
                    )
                  )
                }
              }
        }
}