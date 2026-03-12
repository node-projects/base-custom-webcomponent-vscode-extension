import { extractCssTemplateBlock } from "./utils/extractCssTemplateBlock";
import { HtmlTagTemplate } from "./interface/IHtmlTemplate";
import { CssTagTemplate } from "./interface/ICssTemplate";
import { HtmlValidator } from "./class/HtmlValidator"
import { CssValidator } from "./class/CssValidator";
import { extractHtmlTemplateBlock } from "./utils/extractHtmlTemplateBlock";
import type { TextDocument, Diagnostic, WorkspaceConfiguration, ExtensionContext} from "vscode";
import { languages, window, workspace } from "vscode";
import * as ps from "parse5"

type Parse5 = typeof ps;
function htmlValidator(
  ps: Parse5,
  htmlTemplateArray: Array<{ htmlTemplate: HtmlTagTemplate }>,
  document: TextDocument,
  diagnosticCollection: Diagnostic[],
  userConfig: WorkspaceConfiguration
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
  document: TextDocument,
  diagnosticCollection: Diagnostic[]
):void
  {
    const validator = new CssValidator(
      cssTemplateArray,
      document,
      diagnosticCollection
    ).validate();
}

export function activate(context: ExtensionContext) {
  // const ps = await import("parse5");
  
  // const diagnostics = vscode.languages.createDiagnosticCollection("myExtension");
  const errorCollection = languages.createDiagnosticCollection("myExtension");

  context.subscriptions.push(errorCollection);

  window.showInformationMessage("Validator is now active");

  const timers = new Map<string, NodeJS.Timeout>();

  const supported = new Set(["typescript","javascript","typescriptreact","javascriptreact"]);

  const schedule = (doc: TextDocument) => {
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
      const diagnosticCollection: Diagnostic[] = [];
      const userConfig = workspace.getConfiguration("html-css-template-validator");
      
      const htmlTemplates = extractHtmlTemplateBlock(doc);
      if (htmlTemplates?.length){
        htmlValidator(ps,htmlTemplates,doc,diagnosticCollection,userConfig);
      }
      
      const cssTemplates = extractCssTemplateBlock(doc)
      if(cssTemplates?.length){
        cssValidator(cssTemplates,doc,diagnosticCollection)
      }
      
      
      errorCollection.set(doc.uri,diagnosticCollection)
      },300))}

  for (const doc of workspace.textDocuments) {
    schedule(doc);
  }

  context.subscriptions.push(
    workspace.onDidChangeTextDocument((e) => schedule(e.document)),
    workspace.onDidOpenTextDocument((doc) => schedule(doc)),
    workspace.onDidCloseTextDocument((doc) => errorCollection.delete(doc.uri)),
    workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("html-css-template-validator")) {
    for (const doc of workspace.textDocuments) {
      if (["typescript", "javascript", "typescriptreact", "javascriptreact"].includes(doc.languageId)) {
        schedule(doc);
      }}}
    })
  );
};
export function deactivate() {}