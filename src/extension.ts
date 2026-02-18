import * as vscode from "vscode";
import { extractHtmlTemplates,extractCssTemplates } from './document/html-document/parse/html-tag-extractor';
import * as cssService from "vscode-css-languageservice"
import { HtmlTagTemplate } from "./interface/IHtmlTemplate";
import { CssTagTemplate } from "./interface/ICssTemplate";
import {HtmlValidator} from "./class/HtmlValidator"
import { CssValidator } from "./class/CssValidator";

type Parse5 = typeof import("parse5", { with: { "resolution-mode": "import" } });
// error collection of vs code
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");

const cssLanguageService = cssService.getCSSLanguageService()

function extractHtmlAndCssBlocks(document: vscode.TextDocument
): {
  contentArrayOfHtmlTemplates:Array<{ htmlTemplate: HtmlTagTemplate }>,
  contentArrayOfCssTemplates:Array<{ cssTemplate: CssTagTemplate }> 
} | undefined
{
  // vs code document text
  const documentText = document.getText();
  // extracted html templates found in documentText
  const htmlTemplates = extractHtmlTemplates(documentText);
  // extracted css templates found in documentText
  const cssTemplates = extractCssTemplates(documentText);
  // Arrays to return
  const contentArrayOfHtmlTemplates: Array<{ htmlTemplate: HtmlTagTemplate }> = [];
  
  const contentArrayOfCssTemplates: Array<{ cssTemplate: CssTagTemplate }> = [];

  htmlTemplates.forEach((template, i) => 
    {
    contentArrayOfHtmlTemplates.push({
      htmlTemplate:{
      tag: template.tag, 
      content: template.content, 
      pos: {startOffset: template.startPos, endOffset: template.endPos}}});
    }
  );
  cssTemplates.forEach((template, i) => 
    {
    contentArrayOfCssTemplates.push({
      cssTemplate:{
      tag: template.tag, 
      content: template.content, 
      pos: {startOffset: template.startPos, endOffset: template.endPos}}});
    }
  );
  if (contentArrayOfCssTemplates.length === 0 && contentArrayOfHtmlTemplates.length === 0){
    vscode.window.showErrorMessage(`didn't find a valid css or html template tag`)
    return undefined
  }

  return {
    contentArrayOfCssTemplates: contentArrayOfCssTemplates,
    contentArrayOfHtmlTemplates: contentArrayOfHtmlTemplates
  };
}

function htmlValidator(
  ps: Parse5,
  htmlTemplateArray: Array<{ htmlTemplate: HtmlTagTemplate }>,
  document: vscode.TextDocument,
  diagnosticCollection: vscode.Diagnostic[]
):void
{
  const validator = new HtmlValidator(
    ps,
    document,
    diagnosticCollection,
  ).validate(htmlTemplateArray);
}

function cssValidator(
  cssTemplateArray: Array<{ cssTemplate: CssTagTemplate }>,
  document: vscode.TextDocument,
  diagnosticCollection: vscode.Diagnostic[],
  cssLanguageService: cssService.LanguageService
):void
  {
    const validator = new CssValidator(
      cssTemplateArray,
      document,
      diagnosticCollection,
      cssLanguageService
    ).validate();
}


export async function activate(context: vscode.ExtensionContext) {
  const ps = await import("parse5");
  
  const diagnostics = vscode.languages.createDiagnosticCollection("myExtension");
  
  context.subscriptions.push(diagnostics);

  vscode.window.showInformationMessage("Validator is now active");
  
  const editor = vscode.window.activeTextEditor;
  
  if (editor) 
    {
      const timers = new Map<string, NodeJS.Timeout>();
      const schedule = (doc: vscode.TextDocument) => {
        if (timers.get(doc.uri.toString())) clearTimeout(timers.get(doc.uri.toString()));
        timers.set
        (
          doc.uri.toString(), setTimeout
          (() => 
          {
          const diagnosticCollection: vscode.Diagnostic[] = [];
          
          const templates = extractHtmlAndCssBlocks(doc);
          if (!templates){return}
          htmlValidator(ps,templates.contentArrayOfHtmlTemplates,doc,diagnosticCollection);
          cssValidator(templates.contentArrayOfCssTemplates,doc,diagnosticCollection,cssLanguageService)
          
          errorCollection.set(doc.uri,diagnosticCollection)
          }
          )
        )
      }

      context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document)),
        vscode.workspace.onDidOpenTextDocument((doc) => schedule(doc)),
        vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri))
      );
    };
};
export function deactivate() {}