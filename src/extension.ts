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
//const document = vscode.window.activeTextEditor!.document;
// Array of allowed Tags
const tagContext = new TagContext();

function extractHtmlAndCssBlocks(document: vscode.TextDocument): {
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


function traverseNode(node: any, depth = 0, offsetsOfPropertiesMap = new Array<{content: informationOfProperties }>(),): 
Array<{content: informationOfProperties }> {
  //nur vorübergehend

  const vscodePositionStyle = node.sourceCodeLocation;

  if (vscodePositionStyle && node.nodeName !== "#text") {
    //console.log(`${node.nodeName} [${vscodePositionStyle.startLine}, ${vscodePositionStyle.startCol}] - [${vscodePositionStyle.endLine}, ${vscodePositionStyle.endCol}]`);
    offsetsOfPropertiesMap.push( {
      content : {
        propertyName: node.nodeName,
        positions : {
        startCol:vscodePositionStyle.startTag?.startCol ?? vscodePositionStyle.startCol, 
        startLine: vscodePositionStyle.startTag?.startLine ?? vscodePositionStyle.startLine, 
        endCol: vscodePositionStyle.startTag?.endCol ?? vscodePositionStyle.endCol, 
        endLine:  vscodePositionStyle.startTag?.endLine ?? vscodePositionStyle.endCol
      }
      }
      })
  } else {
    console.error(`didn't find a valid html tag, found: ${node.nodeName}`);
  }

  // Attribute + deren Positionen
  if (node.attrs && node.attrs.length > 0) {
    
    for (const attr of node.attrs) {
      
      const nodeChild = vscodePositionStyle?.attrs?.[attr.name]; // <- positions for this attribute
      
      if (nodeChild) {
        // console.log(
        //   `${attr.name}=${JSON.stringify(attr.value)} ` +
        //   `[${childVscodePositionStyle.startLine}, ${childVscodePositionStyle.startCol}] - [${childVscodePositionStyle.endLine}, ${childVscodePositionStyle.endCol}]`
        // );
        offsetsOfPropertiesMap.push({ 
          content:{
            propertyName: attr.name,
            positions : {
            startCol:nodeChild.startTag?.startCol ?? nodeChild.startCol, 
            startLine: nodeChild.startTag?.startLine ?? nodeChild.startLine, 
            endCol: nodeChild.startTag?.endCol ?? nodeChild.endCol, 
            endLine:  nodeChild.startTag?.endLine ?? nodeChild.endLine
          } 
          }
        });
      } 
      else {
        console.error(`didn't find a valid html tag, found: ${attr.name}=${JSON.stringify(attr.value)}`);
      }
    }
  }

  // Kinder
  if (node.childNodes) {
    for (const child of node.childNodes) traverseNode(child, depth + 1, offsetsOfPropertiesMap);
  }
  return offsetsOfPropertiesMap;
}

function createPositions(templateStartPos: vscode.Position, item: informationOfProperties): { 
  absoluteStartLine: number; absoluteEndLine: number; absoluteStartCol: number; absoluteEndCol: number } {
  const absoluteStartLine = templateStartPos.line + (item.positions.startLine - 1);

  const absoluteEndLine = templateStartPos.line + (item.positions.endLine - 1);
  
  // Für die erste Zeile des Templates muss die Column des Template-Starts addiert werden
  const absoluteStartCol = (item.positions.startLine === 1) 
    ? templateStartPos.character + item.positions.startCol
    : item.positions.startCol;
    
  const absoluteEndCol = (item.positions.endLine === 1)
    ? templateStartPos.character + item.positions.endCol
    : item.positions.endCol;

  return { absoluteStartLine, absoluteEndLine, absoluteStartCol, absoluteEndCol };  
}

function diagnosticPrinter( ps:Parse5,
                            HtmlTemplateArray: Array<{ tag: string; content: string; Pos: positionOfContent }>,
                            document: vscode.TextDocument):void {
  // local diagnostic collection to fill with errors from every template
  const diagnosticCollection: vscode.Diagnostic[] = [];
  // extracting each html property from each template and registering diagnostic if found
  for (const elementOfHtmlTemplateArray of HtmlTemplateArray){
      
    const parsedHtml = ps.parseFragment(elementOfHtmlTemplateArray?.content, { sourceCodeLocationInfo: true });
      
    const arrayOfExtractedHtmlContent = traverseNode(parsedHtml);
    
    const templateStartPos = document.positionAt(elementOfHtmlTemplateArray.Pos.startPos);

      for (const [ _, item] of arrayOfExtractedHtmlContent.entries()) {

        if(!tagContext.isAllowed(item.content.propertyName) && item.content.propertyName !== "#text") {

          const correctedPositions = createPositions(templateStartPos, item.content);
              
        const newDiagnostic = new vscode.Diagnostic(
            new vscode.Range(new vscode.Position(
              correctedPositions.absoluteStartLine,correctedPositions.absoluteStartCol
            ),
            new vscode.Position(
                correctedPositions.absoluteEndLine, correctedPositions.absoluteEndCol
              )
            ),
            `Propertie ${item.content.propertyName} is unknown. Check for typos.`,
            vscode.DiagnosticSeverity.Warning
          );
          diagnosticCollection.push(newDiagnostic);
        }
    }
}
  // set diagnostics
  errorCollection.set(document.uri, diagnosticCollection);
}

export async function activate(context: vscode.ExtensionContext) {
  const ps = await import("parse5");
  const diagnostics = vscode.languages.createDiagnosticCollection("myExtension");
  context.subscriptions.push(diagnostics);


  const disposable = vscode.commands.registerCommand("helloworld.helloWorld", () => 
    {
    vscode.window.showInformationMessage("Html validator is now active");
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
            const templates = extractHtmlAndCssBlocks(doc);
            diagnosticPrinter(ps,templates.contentArrayOfHtmlTemplates,doc);
            }
            )
          )
        }

        context.subscriptions.push(
          vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document)),
          vscode.workspace.onDidOpenTextDocument((doc) => schedule(doc)),
          vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri))
        );
      }
    }
    );
  
  context.subscriptions.push(disposable);
};
export function deactivate() {}