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
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");
type Parse5 = typeof import("parse5", { with: { "resolution-mode": "import" } });
const document = vscode.window.activeTextEditor!.document;
type positionOfContent = { startPos: number; endPos: number };
type positionOfContentVscode = { startLine: number; startCol: number; endLine: number; endCol: number };
type informationOfProperties = {propertyName: string;positions: positionOfContentVscode;};
const tagContext = new TagContext();

function extractHtmlAndCssBlocks(): {contentArrayOfHtmlTemplates:Array<{ tag: string; content: string; Pos: positionOfContent }>,
                                contentArrayOfCssTemplates:Array<{ tag: string; content: string; Pos: positionOfContent }>} 
{
  const text = document.getText();
  const templatesHtml = extractHtmlTemplates(text);
  const templatesCss = extractCssTemplates(text);
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
  return {contentArrayOfCssTemplates:contentArrayOfCssTemplates,contentArrayOfHtmlTemplates:contentArrayOfHtmlTemplates};
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
    //   if (vscodePositionStyle.endTag) {
    //     const start = new vscode.Position(
    //       vscodePositionStyle.endTag.startLine, 
    //       vscodePositionStyle.endTag.startCol
    //     );
    //     const end = new vscode.Position(
    //       vscodePositionStyle.endTag.endLine, 
    //       vscodePositionStyle.endTag.endCol-2
    //     );
    //     const propertyNameFromTheDocument = document.getText(
    //       new vscode.Range(
    //         start,end
    //       )
    //     );
    //     offsetsOfPropertiesMap.set(indexCounter.value++, {
    //       propertyName: propertyNameFromTheDocument, 
    //       positions : {
    //         startCol:vscodePositionStyle.endTag?.startCol ?? vscodePositionStyle.startCol, 
    //         startLine: vscodePositionStyle.endTag?.startLine ?? vscodePositionStyle.startLine, 
    //         endCol: vscodePositionStyle.endTag?.endCol ?? vscodePositionStyle.endCol, 
    //         endLine:  vscodePositionStyle.endTag?.endLine ?? vscodePositionStyle.endCol
    //   }
    //   })
    // }
    //   ;
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
      // if (childVscodePositionStyle.endTag) {
      //   const start = new vscode.Position(
      //     childVscodePositionStyle.endTag.startLine, 
      //     childVscodePositionStyle.endTag.startCol
      //   );
      //   const end = new vscode.Position(
      //     childVscodePositionStyle.endTag.endLine, 
      //     childVscodePositionStyle.endTag.endCol-1
      //   );
      //   const propertyNameFromTheDocument = document.getText(
      //     new vscode.Range(
      //       start,end
      //     )
      //   );
      //   offsetsOfPropertiesMap.set(indexCounter.value++, {
      //     propertyName: propertyNameFromTheDocument, 
      //     positions : {
      //       startCol:childVscodePositionStyle.endTag?.startCol ?? childVscodePositionStyle.startCol, 
      //       startLine: childVscodePositionStyle.endTag?.startLine ?? childVscodePositionStyle.startLine, 
      //       endCol: childVscodePositionStyle.endTag?.endCol ?? childVscodePositionStyle.endCol, 
      //       endLine:  childVscodePositionStyle.endTag?.endLine ?? childVscodePositionStyle.endCol
      //     }
      //   })
      // }
      
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

//function diagnosticPrinter(offsetsOfPropertiesMap: Map<number, informationOfProperties>):void {
function diagnosticPrinter(ps:Parse5,HtmlTemplateArray: Array<{ tag: string; content: string; Pos: positionOfContent }>):void {
  
  const diagnosticCollection: vscode.Diagnostic[] = []; // wenn ich /div falsch schreibe dann kommt kein fehler
  
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