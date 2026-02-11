import * as vscode from "vscode";
import { extractHtmlTemplates,extractCssTemplates } from './document/html-document/parse/html-tag-extractor';
import { printInternalMessage } from "./internalPrinter";
import type { DefaultTreeAdapterMap } from "parse5" with { "resolution-mode": "import" };
import { getLanguageService, TextDocument } from 'vscode-html-languageservice';
import { parse } from "node-html-parser";
import { HtmlNode } from "lit-analyzer/lib/analyze/types/html-node/html-node-types";
import type { Node as HtmlParserNode } from "node-html-parser";
import { HTMLElement } from "node-html-parser";
import { TagContext } from "./utils/allowed-tags";
import arrayToTree from "performant-array-to-tree";
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");

const document = vscode.window.activeTextEditor!.document;
type positionOfContent = { startPos: number; endPos: number };
type positionOfContentVscode = { startLine: number; startCol: number; endLine: number; endCol: number };
type informationOfProperties = {propertyName: string;positions: positionOfContentVscode;};
const tagContext = new TagContext();

// type TagItem = {
//   id: string;
//   parentId: string | null;
// };
// const items = tagContext.getAll()

// const item: TagItem[] = [...items].map(tag => ({
//   id: tag,
//   parentId: null // oder berechnet
// }));

// const tree = arrayToTree.arrayToTree(item, {
//   id: "id",
//   parentId: "parentId",
//   childrenField: "children"
// });



function extractHtmlAndCssBlocks(): {contentArrayOfHtmlTemplates:Array<{ tag: string; content: string; Pos: positionOfContent }>,
                                contentArrayOfCssTemplates:Array<{ tag: string; content: string; Pos: positionOfContent }>} 
{
  const text = document.getText();
  const templatesHtml = extractHtmlTemplates(text);
  const templatesCss = extractCssTemplates(text);
  const contentArrayOfHtmlTemplates: Array<{ tag: string; content: string; Pos: positionOfContent }> = [];
  const contentArrayOfCssTemplates: Array<{ tag: string; content: string; Pos: positionOfContent }> = [];

  
  // console.log(`Gefunden: ${templatesHtml.length} html Templates`);

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

// function extractHtmlData(html: HTMLElement,position: positionOfContent): void {
//   const diagnosticCollection: vscode.Diagnostic[] = [];
  
  
//   const extractedProperties = Array.from(html.querySelectorAll("*"));
//   //const checking = extractedProperties.
//   for (const el of extractedProperties) {
//     const tagName = el.tagName.toLowerCase();

//     const positionOfPropertie : positionOfContent =  { 
//       startPos: el.range[0] + position.startPos + 5 , //die 5 hier ist die länge vom tag html`, muss durch plus 5 übersprungen werden
//       endPos: el.range[0] + position.startPos + 5 + tagName.length 
//     };
//     if(!tagContext.isAllowed(tagName)) {
//       const diagnostic = new vscode.Diagnostic(
//         new vscode.Range(document.positionAt(positionOfPropertie.startPos), document.positionAt(positionOfPropertie.endPos)),
//         `Tag <${tagName}> is not allowed.`,
//         vscode.DiagnosticSeverity.Warning
//       );
//       diagnosticCollection.push(diagnostic);
//     }

//     const attrs = (el as any).attributes as Record<string, string>;
      
//     for (const [attrName, attrValue] of Object.entries(attrs)) {
//       console.log("")
//     }
//   }
//   errorCollection.set(document.uri, diagnosticCollection);
// }



// Option 1: so kann ich auf alle inhalte zugreifen
// function walk(node: any, depth = 0) {
//   const elements = []
//   const indent = " ".repeat(depth * 2);

//   // Node-Header
//   console.log(indent + node.nodeName);

//   // Attribute sauber ausgeben
//   if (node.attrs && node.attrs.length > 0) {

//     for (const attr of node.attrs) {
//       console.log(
//         attr.name
//         //indent + "" + attr.name + " = " + JSON.stringify(attr.value)
//       );
//     }
//   }

//   // Kinder traversieren
//   if (node.childNodes) {
//     for (const child of node.childNodes) {
//       walk(child, depth + 1);
//     }
//   }
// }


function traverseNode(node: any, depth = 0, offsetsOfPropertiesMap = new Map<number, informationOfProperties>(),
  indexCounter = { value: 0 }): Map<number, informationOfProperties> {
  //nur vorübergehend
  const indent = " ".repeat(depth * 2);
  // console.log(node.childNodes[1].childNodes[0].sourceCodeLocation.startCol);
  // console.log(node.childNodes[1].childNodes[0].sourceCodeLocation.startLine);
  


  /* Auf dieser Weise kann ich die genauen tags und weitere positionen extrahieren
  console.log("startoffset innerer text: ",document.offsetAt(new vscode.Position(
    node.childNodes[1].childNodes[0].sourceCodeLocation.startLine,
     node.childNodes[1].childNodes[0].sourceCodeLocation.startCol)))
  console.log("endoffset innerer text: ",document.offsetAt(new vscode.Position(
  node.childNodes[1].childNodes[0].sourceCodeLocation.endLine,
    node.childNodes[1].childNodes[0].sourceCodeLocation.endCol)))

  console.log("startoffset von div", document.offsetAt(new vscode.Position(
    node.childNodes[1].sourceCodeLocation.startLine,
     node.childNodes[1].sourceCodeLocation.startCol)))

  console.log("endoffset innerer text: ",document.offsetAt(new vscode.Position(
  node.childNodes[1].sourceCodeLocation.endLine,
    node.childNodes[1].sourceCodeLocation.endCol)))

  const startoffsetdiv = document.offsetAt(new vscode.Position(
    node.childNodes[1].sourceCodeLocation.startLine,
     node.childNodes[1].sourceCodeLocation.startCol));

  const startoffsetinnertext = document.offsetAt(new vscode.Position(
    node.childNodes[1].childNodes[0].sourceCodeLocation.startLine,
     node.childNodes[1].childNodes[0].sourceCodeLocation.startCol));

  console.log(document.getText(new vscode.Range(document.positionAt(startoffsetdiv-1),document.positionAt(startoffsetinnertext-1))));
  */ 
  // console.log(node.childNodes[1].childNodes[0].sourceCodeLocation.endCol);
  // console.log(node.childNodes[1].childNodes[0].sourceCodeLocation.endLine);
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
      if (vscodePositionStyle.endTag) {
        const start = new vscode.Position(
          vscodePositionStyle.endTag.startLine, 
          vscodePositionStyle.endTag.startCol
        );
        const end = new vscode.Position(
          vscodePositionStyle.endTag.endLine, 
          vscodePositionStyle.endTag.endCol-2
        );
        const propertyNameFromTheDocument = document.getText(
          new vscode.Range(
            start,end
          )
        );
        offsetsOfPropertiesMap.set(indexCounter.value++, {
          propertyName: propertyNameFromTheDocument, 
          positions : {
            startCol:vscodePositionStyle.endTag?.startCol ?? vscodePositionStyle.startCol, 
            startLine: vscodePositionStyle.endTag?.startLine ?? vscodePositionStyle.startLine, 
            endCol: vscodePositionStyle.endTag?.endCol ?? vscodePositionStyle.endCol, 
            endLine:  vscodePositionStyle.endTag?.endLine ?? vscodePositionStyle.endCol
      }
      })
    }
      ;
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
      if (childVscodePositionStyle.endTag) {
        const start = new vscode.Position(
          childVscodePositionStyle.endTag.startLine, 
          childVscodePositionStyle.endTag.startCol
        );
        const end = new vscode.Position(
          childVscodePositionStyle.endTag.endLine, 
          childVscodePositionStyle.endTag.endCol-1
        );
        const propertyNameFromTheDocument = document.getText(
          new vscode.Range(
            start,end
          )
        );
        offsetsOfPropertiesMap.set(indexCounter.value++, {
          propertyName: propertyNameFromTheDocument, 
          positions : {
            startCol:childVscodePositionStyle.endTag?.startCol ?? childVscodePositionStyle.startCol, 
            startLine: childVscodePositionStyle.endTag?.startLine ?? childVscodePositionStyle.startLine, 
            endCol: childVscodePositionStyle.endTag?.endCol ?? childVscodePositionStyle.endCol, 
            endLine:  childVscodePositionStyle.endTag?.endLine ?? childVscodePositionStyle.endCol
          }
        })
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

function diagnosticPrinter(offsetsOfPropertiesMap: Map<number, informationOfProperties>): void {
  const diagnosticCollection: vscode.Diagnostic[] = []; // wenn ich /div falsch schreibe dann kommt kein fehler
  
  for (const [index, informationOfBrackets] of offsetsOfPropertiesMap) {
    if(!tagContext.isAllowed(informationOfBrackets.propertyName) && informationOfBrackets.propertyName !== "#text") {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range
          (
            new vscode.Position
            (
            informationOfBrackets.positions.startLine, 
            informationOfBrackets.positions.startCol
          ),
            new vscode.Position
            (
              informationOfBrackets.positions.endLine, 
              informationOfBrackets.positions.endCol
            )
          ),
          `Propertie ${informationOfBrackets.propertyName} is unknown.`,
          vscode.DiagnosticSeverity.Warning
        );
        diagnosticCollection.push(diagnostic);
      }
  }
  errorCollection.set(document.uri, diagnosticCollection);
}

export async function activate(context: vscode.ExtensionContext) {
  const ps = await import("parse5");
  const offsetsOfPropertiesMap = new Map<number, informationOfProperties>()
  const diagnostics = vscode.languages.createDiagnosticCollection("myExtension");
  context.subscriptions.push(diagnostics);

  
  
  //errorCollection.set(document.uri, diagnosticCollection);
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
          timers.set(key, setTimeout(() => {
            templates = extractHtmlAndCssBlocks();
            informationOfCssTemplates = templates.contentArrayOfCssTemplates;
            informationOfHtmlTemplates = templates.contentArrayOfHtmlTemplates;
            
        //     // astOfHtml = ps.parse( // Rekrusiver Baum, ich kann aus jedem Div(also Node) die inhalte extrahieren also in diesem Fall die Properties
        //     //   (() => {
        //     //   const content = informationOfHtmlTemplates[0]?.content;
        //     //    if(!content) throw new Error("Error: Content is undefined");
        //     //    return content;
        //     //   })(),
        //     // { sourceCodeLocationInfo: true });

            const root = parse(informationOfHtmlTemplates[0]?.content);
            const root2 = parse(informationOfHtmlTemplates[1]?.content);
            const astofhtml = ps.parseFragment(informationOfHtmlTemplates[0]?.content, { sourceCodeLocationInfo: true });
            const allProperties = traverseNode(astofhtml);
            diagnosticPrinter(allProperties);
            console.log("")
        }))}
        //     extractHtmlData(root, informationOfHtmlTemplates[0].Pos);
        //     timers.delete(key);}, 200));
        // };
        context.subscriptions.push(
          vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document)),
        );

        
        
        //const checkIfTrue = tagContext.isAllowed(input!.hasAttribute(".checked")); // true

        //const type = input?.attributes; // "checkbox"

        //console.log("Type of the input element:", type); // "checkbox"
        
        // ich bislang nur relativ nicht absolut (Jochen fragen was als nächstes zutun ist also was soll überprüft werden)
        // ich kann auch die tags extrahieren und auswerten
      }
    }
    );
  
  context.subscriptions.push(disposable);
};
export function deactivate() {}