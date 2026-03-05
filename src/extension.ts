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
  diagnosticCollection: vscode.Diagnostic[],
  userConfig: vscode.WorkspaceConfiguration
):void
{
  const validator = new HtmlValidator(
    ps,
    document,
    diagnosticCollection,
    userConfig
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
  const supported = new Set(["typescript","javascript","typescriptreact","javascriptreact"]);
  const schedule = (doc: vscode.TextDocument) => {
    if (!supported.has(doc.languageId)) {
      errorCollection.delete(doc.uri);
      return;
    }
    const key = doc.uri.toString();
    if (timers.get(key)) clearTimeout(timers.get(key));
    timers.set
    (
      key, setTimeout
      (() => 
      {
      timers.delete(key);
      const diagnosticCollection: vscode.Diagnostic[] = [];
      const userConfig = vscode.workspace.getConfiguration("html-css-template-validator");
      const htmlTemplates = extractHtmlTemplateBlock(doc);
      if (!htmlTemplates){return}
      htmlValidator(ps,htmlTemplates,doc,diagnosticCollection,userConfig);
      const cssTemplates = extractCssTemplateBlock(doc)
      if(!cssTemplates){return}
      cssValidator(cssTemplates,doc,diagnosticCollection)
      
      errorCollection.set(doc.uri,diagnosticCollection)
      },300))}

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document)),
    vscode.workspace.onDidOpenTextDocument((doc) => schedule(doc)),
    vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri)),
    vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("html-css-template-validator")) {
    for (const doc of vscode.workspace.textDocuments) {
      if (["typescript", "javascript", "typescriptreact", "javascriptreact"].includes(doc.languageId)) {
        schedule(doc);
      }}}
    })
  );
};
export function deactivate() {}