import * as vscode from "vscode";
import { extractCssTemplateBlock } from "./utils/extractCssTemplateBlock";
import { HtmlTagTemplate } from "./interface/IHtmlTemplate";
import { CssTagTemplate } from "./interface/ICssTemplate";
import {HtmlValidator} from "./class/HtmlValidator"
import { CssValidator } from "./class/CssValidator";
import { extractHtmlTemplateBlock } from "./utils/extractHtmlTemplateBlock";

type Parse5 = typeof import("parse5", { with: { "resolution-mode": "import" } });
// error collection of vs code
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");

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
  diagnosticCollection: vscode.Diagnostic[]
):void
  {
    const validator = new CssValidator(
      cssTemplateArray,
      document,
      diagnosticCollection
    ).validate();
}

export async function activate(context: vscode.ExtensionContext) {
  const ps = await import("parse5");
  
  const diagnostics = vscode.languages.createDiagnosticCollection("myExtension");
  
  context.subscriptions.push(diagnostics);

  vscode.window.showInformationMessage("Validator is now active");
  const timers = new Map<string, NodeJS.Timeout>();
  const schedule = (doc: vscode.TextDocument) => {
    if (timers.get(doc.uri.toString())) clearTimeout(timers.get(doc.uri.toString()));
    timers.set
    (
      doc.uri.toString(), setTimeout
      (() => 
      {
      const diagnosticCollection: vscode.Diagnostic[] = [];
      
      const htmlTemplates = extractHtmlTemplateBlock(doc);
      if (!htmlTemplates){return}
      htmlValidator(ps,htmlTemplates,doc,diagnosticCollection);
      const cssTemplates = extractCssTemplateBlock(doc)
      if(!cssTemplates){return}
      cssValidator(cssTemplates,doc,diagnosticCollection)
      
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
export function deactivate() {}