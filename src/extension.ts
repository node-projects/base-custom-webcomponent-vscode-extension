import * as vscode from "vscode";
import { extractHtmlTemplates,extractCssTemplates } from './document/html-document/parse/html-tag-extractor';
import { printInternalMessage } from "./internalPrinter";
//import type { DefaultTreeAdapterMap } from "parse5" with { "resolution-mode": "import" };
//import { getLanguageService, TextDocument } from 'vscode-html-languageservice';
import { parse } from "node-html-parser";
//import { HtmlNode } from "lit-analyzer/lib/analyze/types/html-node/html-node-types";
//import type { Node as HtmlParserNode } from "node-html-parser";
//import { HTMLElement } from "node-html-parser";
import { TagContext } from "./utils/allowed-tags";
import { error } from "console";
//import arrayToTree from "performant-array-to-tree";

type Parse5 = typeof import("parse5", { with: { "resolution-mode": "import" } });
type positionOfContent = { startPos: number; endPos: number };
type positionOfContentRangeFormat = { startLine: number; startCol: number; endLine: number; endCol: number };
type informationOfProperties = { propertyName: string; positions: positionOfContentRangeFormat;};
// error collection of vs code
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");
// current open document in vs code
const document = vscode.window.activeTextEditor!.document;
// Array of allowed Tags
const tagContext = new TagContext();

function extractHtmlAndCssBlocks(): {
  contentArrayOfHtmlTemplates:Array<{ tag: string; content: string; Pos: positionOfContent }>,
  contentArrayOfCssTemplates:Array<{ tag: string; content: string; Pos: positionOfContent }>
} 
{
  // vs code document text
  const documentText = document.getText();
  // extracted html templates found in documentText
  const templatesHtml = extractHtmlTemplates(documentText);
  // extracted css templates found in documentText
  const templatesCss = extractCssTemplates(documentText);
  // Arrays to return
  const contentArrayOfHtmlTemplates: Array<{ tag: string; content: string; Pos: positionOfContent }> = [];
  const contentArrayOfCssTemplates: Array<{ tag: string; content: string; Pos: positionOfContent }> = [];

  templatesHtml.forEach((template, i) => 
    {
    contentArrayOfHtmlTemplates.push({tag: template.tag, 
                                      content: template.content, 
                                      Pos: {startPos: template.startPos, endPos: template.endPos} 
                                  }
                                );
    printInternalMessage(document.positionAt(template.startPos),
                         document.getText(new vscode.Range(document.positionAt(template.startPos), 
                                                           document.positionAt(template.startPos + 1))),
                         template.content)
    }
  );
  templatesCss.forEach((template, i) => 
    {
    printInternalMessage(document.positionAt(template.startPos),
                         document.getText(new vscode.Range(document.positionAt(template.startPos), 
                                                           document.positionAt(template.startPos + 1))),
                         template.content)
    }
  );
  return {
    contentArrayOfCssTemplates: contentArrayOfCssTemplates,
    contentArrayOfHtmlTemplates: contentArrayOfHtmlTemplates
  };
}


function traverseNode(node: any, depth = 0, offsetsOfPropertiesMap = new Map<number, informationOfProperties>(),
  indexCounter = { value: 0 }): Map<number, informationOfProperties> {
  //nur vorübergehend
  const indent = " ".repeat(depth * 2);

  const vscodePositionStyle = node.sourceCodeLocation;
  if (vscodePositionStyle && node.nodeName !== "#text") {
    console.log(`${node.nodeName} [${vscodePositionStyle.startLine}, ${vscodePositionStyle.startCol}] - [${vscodePositionStyle.endLine}, ${vscodePositionStyle.endCol}]`);
    offsetsOfPropertiesMap.set(indexCounter.value++, {
      propertyName: node.nodeName, 
      positions : {
        startCol:vscodePositionStyle.startTag?.startCol ?? vscodePositionStyle.startCol, 
        startLine: vscodePositionStyle.startTag?.startLine ?? vscodePositionStyle.startLine, 
        endCol: vscodePositionStyle.startTag?.endCol ?? vscodePositionStyle.endCol, 
        endLine:  vscodePositionStyle.startTag?.endLine ?? vscodePositionStyle.endCol
      }
      })
  } else {
    console.log(`${node.nodeName}`);
  }

  // Attribute + deren Positionen
  if (node.attrs && node.attrs.length > 0) {
    for (const attr of node.attrs) {
      const childVscodePositionStyle = vscodePositionStyle?.attrs?.[attr.name]; // <- positions for this attribute
      if (childVscodePositionStyle) {
        console.log(
          `${attr.name}=${JSON.stringify(attr.value)} ` +
          `[${childVscodePositionStyle.startLine}, ${childVscodePositionStyle.startCol}] - [${childVscodePositionStyle.endLine}, ${childVscodePositionStyle.endCol}]`
          
        );
        offsetsOfPropertiesMap.set(indexCounter.value++, { 
          propertyName: attr.name, 
          positions : {
            startCol:childVscodePositionStyle.startTag?.startCol ?? childVscodePositionStyle.startCol, 
            startLine: childVscodePositionStyle.startTag?.startLine ?? childVscodePositionStyle.startLine, 
            endCol: childVscodePositionStyle.startTag?.endCol ?? childVscodePositionStyle.endCol, 
            endLine:  childVscodePositionStyle.startTag?.endLine ?? childVscodePositionStyle.endLine
          } 
        });
      } 
      else {
        console.log(`${attr.name}=${JSON.stringify(attr.value)}`);
      }
    }
  }

  // Kinder
  if (node.childNodes) {
    for (const child of node.childNodes) traverseNode(child, depth + 1, offsetsOfPropertiesMap, indexCounter);
  }
  return offsetsOfPropertiesMap;
}

function diagnosticPrinter(ps:Parse5,HtmlTemplateArray: Array<{ tag: string; content: string; Pos: positionOfContent }>):void {
  // local diagnostic collection to fill with errors from every template
  const diagnosticCollection: vscode.Diagnostic[] = [];
  // extracting each html property from each template and registering diagnostic if found
  for (const elementOfHtmlTemplateArray of HtmlTemplateArray){
      const astofhtml = ps.parseFragment(elementOfHtmlTemplateArray?.content, { sourceCodeLocationInfo: true });
      const mapOfExtractedHtmlTemplateElementAndProperties = traverseNode(astofhtml);
    
      const templateStartPos = document.positionAt(elementOfHtmlTemplateArray.Pos.startPos);
      for (const [index, informationOfProperties] of mapOfExtractedHtmlTemplateElementAndProperties) {
        if(!tagContext.isAllowed(informationOfProperties.propertyName) && informationOfProperties.propertyName !== "#text") {
          const absoluteStartLine = templateStartPos.line + (informationOfProperties.positions.startLine - 1);
          const absoluteEndLine = templateStartPos.line + (informationOfProperties.positions.endLine - 1);
          
          // Für die erste Zeile des Templates muss die Column des Template-Starts addiert werden
          const absoluteStartCol = (informationOfProperties.positions.startLine === 1) 
            ? templateStartPos.character + informationOfProperties.positions.startCol
            : informationOfProperties.positions.startCol;
            
          const absoluteEndCol = (informationOfProperties.positions.endLine === 1)
            ? templateStartPos.character + informationOfProperties.positions.endCol
            : informationOfProperties.positions.endCol;
              
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range
            (
              new vscode.Position
              (
              absoluteStartLine, absoluteStartCol
            ),
              new vscode.Position
              (
                absoluteEndLine, absoluteEndCol
              )
            ),
            `Propertie ${informationOfProperties.propertyName} is unknown.`,
            vscode.DiagnosticSeverity.Warning
          );
          diagnosticCollection.push(diagnostic);
        }
    }
}
  // set diagnostics
  errorCollection.set(document.uri, diagnosticCollection);
}

export async function activate(context: vscode.ExtensionContext) {
  const ps = await import("parse5");
  const offsetsOfPropertiesMap = new Map<number, informationOfProperties>()
  const diagnostics = vscode.languages.createDiagnosticCollection("myExtension");
  context.subscriptions.push(diagnostics);

  var templates;
  var informationOfCssTemplates;
  var informationOfHtmlTemplates;

  const disposable = vscode.commands.registerCommand("helloworld.helloWorld", () => 
    {
    vscode.window.showInformationMessage("Hello World (Validation aktiv)!");
    const editor = vscode.window.activeTextEditor;
    if (editor) 
      {
        const timers = new Map<string, NodeJS.Timeout>();
        const schedule = (doc: vscode.TextDocument) => {
          const key = doc.uri.toString();
          const prev = timers.get(key);
          if (prev) clearTimeout(prev);
          timers.set
          (
            key, setTimeout
            (() => 
            {
            templates = extractHtmlAndCssBlocks();
            informationOfCssTemplates = templates.contentArrayOfCssTemplates;
            informationOfHtmlTemplates = templates.contentArrayOfHtmlTemplates;

            diagnosticPrinter(ps,informationOfHtmlTemplates);
            }
            )
          )
        }

        context.subscriptions.push(
          vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document)),
        );
      }
    }
    );
  
  context.subscriptions.push(disposable);
};
export function deactivate() {}