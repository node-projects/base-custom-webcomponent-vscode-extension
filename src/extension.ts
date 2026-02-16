import * as vscode from "vscode";
import { extractHtmlTemplates,extractCssTemplates } from './document/html-document/parse/html-tag-extractor';
import { printInternalMessage } from "./utils/internalPrinter";
import * as htmlService from "vscode-html-languageservice";
import {ITagData} from "./interface/tagData"
import { customElement } from "./class/customElement";

type Parse5 = typeof import("parse5", { with: { "resolution-mode": "import" } });
type positionOfContent = { startPos: number; endPos: number };
type positionOfContentRangeFormat = { startLine: number; startCol: number; endLine: number; endCol: number };
type informationOfProperties = { propertyName: string; positions: positionOfContentRangeFormat;};
type informationOfPropertiesOffsetFormat = { propertyName: string; positions: positionOfContent;};
// error collection of vs code
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");
// current open document in vs code
//const document = vscode.window.activeTextEditor!.document;
// Array of allowed Tags

const htmlLanguageService = htmlService.getDefaultHTMLDataProvider();
const myOwnAttributes = new customElement;

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


function traverseNode(node: any, depth = 0, offsetsOfPropertiesMap = new Array<{content: informationOfPropertiesOffsetFormat }>()): 
ITagData {
  //nur vorübergehend
  
  const vscodePositionStyle = node.sourceCodeLocation;
  const vscodee = {} as ITagData
  if (vscodePositionStyle && node.nodeName !== "#text") {
    //console.log(`${node.nodeName} [${vscodePositionStyle.startLine}, ${vscodePositionStyle.startCol}] - [${vscodePositionStyle.endLine}, ${vscodePositionStyle.endCol}]`);
    offsetsOfPropertiesMap.push( {
      content : {
        propertyName: node.nodeName,
        positions : {
        startPos: vscodePositionStyle.startTag?.startOffset ?? vscodePositionStyle.startOffset,
        endPos: vscodePositionStyle.startTag?.endOffset ?? vscodePositionStyle.endOffset,
      }
      }
      })
      vscodee.name = node.nodeName
      vscodee.attributes = []
      vscodee.startOffset = vscodePositionStyle.startTag?.startOffset ?? vscodePositionStyle.startOffset
      vscodee.endOffset = vscodePositionStyle.startTag?.endOffset ?? vscodePositionStyle.endOffset
    
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
            startPos: nodeChild.startTag?.startOffset ?? nodeChild.startOffset,
            endPos: nodeChild.startTag?.endOffset ?? nodeChild.endOffset,
          } 
          }
        });
        vscodee.attributes.push({
          name: attr.name,
          startOffset: nodeChild.startTag?.startOffset ?? nodeChild.startOffset,
          endOffset:nodeChild.startTag?.endOffset ?? nodeChild.endOffset
        })
        
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
  return vscodee;
}

function createPositions( templateTag: string,
                          templateStartPos: positionOfContent, 
                          startOff: number, endOff: number): { globalStartOffset: number;
                                                                        globalEndOffset: number } 
{ // +1 for the opening bracket of the tag
  const globalStartOffset = startOff + templateStartPos.startPos + templateTag.length + 1; 
  // +1 for the opening bracket of the tag
  const globalEndOffset = endOff + templateStartPos.startPos + templateTag.length + 1; 

  return { globalStartOffset: globalStartOffset, globalEndOffset: globalEndOffset };  
}

function diagnosticPrinter( ps:Parse5,
                            HtmlTemplateArray: Array<{ tag: string; content: string; Pos: positionOfContent }>,
                            document: vscode.TextDocument):void 
{
  const validTagNames = new Set(htmlLanguageService.provideTags().map(t => t.name));


  // local diagnostic collection to fill with errors from every template
  const diagnosticCollection: vscode.Diagnostic[] = [];
  // extracting each html property from each template and registering diagnostic if found
  for (const elementOfHtmlTemplateArray of HtmlTemplateArray){
    
    // Parsing the found template with relative offsets
    const parsedHtml = ps.parseFragment(elementOfHtmlTemplateArray?.content, { sourceCodeLocationInfo: true });
    for (const node of parsedHtml.childNodes) {
    const arrayOfExtractedHtmlContent = traverseNode(node);
      
      if (validTagNames.has(arrayOfExtractedHtmlContent.name)){
        
        for (const item of arrayOfExtractedHtmlContent.attributes) {
        
          const validAttributeNames = new Set(htmlLanguageService.provideAttributes(arrayOfExtractedHtmlContent.name).map(t => t.name))
          const customValidAttributeNames = new Set(myOwnAttributes.provideAttributes(arrayOfExtractedHtmlContent.name).map(t => t.name))

        if(item.name !== "#text" && !validAttributeNames.has(item.name) && !customValidAttributeNames.has(item.name)) {

          const tagPositions = createPositions( elementOfHtmlTemplateArray.tag,
                                                elementOfHtmlTemplateArray.Pos, 
                                                item.startOffset,item.endOffset);
          
          const newDiagnostic = new vscode.Diagnostic(
              new vscode.Range(
                document.positionAt(tagPositions.globalStartOffset),
                document.positionAt(tagPositions.globalEndOffset)
              ),
              `Propertie ${item.name} is unknown. Check for typos.`,
              vscode.DiagnosticSeverity.Warning
            );
            diagnosticCollection.push(newDiagnostic);
        }
        }

      }
      else{
        const tagPositions = createPositions( elementOfHtmlTemplateArray.tag,
                                                elementOfHtmlTemplateArray.Pos, 
                                                arrayOfExtractedHtmlContent.startOffset,arrayOfExtractedHtmlContent.endOffset);
          
          const newDiagnostic = new vscode.Diagnostic(
              new vscode.Range(
                document.positionAt(tagPositions.globalStartOffset),
                document.positionAt(tagPositions.globalEndOffset)
              ),
              `Propertie ${arrayOfExtractedHtmlContent.name} is unknown. Check for typos.`,
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