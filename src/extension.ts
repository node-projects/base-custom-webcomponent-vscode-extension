import * as vscode from "vscode";
import { extractHtmlTemplates,extractCssTemplates } from './document/html-document/parse/html-tag-extractor';
import { printInternalMessage } from "./utils/internalPrinter";
import * as htmlService from "vscode-html-languageservice";
import {ITagData} from "./interface/tagData"
import { customElement } from "./class/customElement";
import * as cssService from "vscode-css-languageservice"
import { isUndefined } from "util";

type Parse5 = typeof import("parse5", { with: { "resolution-mode": "import" } });
type positionOfContent = { startPos: number; endPos: number };



// error collection of vs code
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");

// imported objects
const htmlLanguageService = htmlService.getDefaultHTMLDataProvider();
const cssLanguageService = cssService.getDefaultCSSDataProvider()
const customHtmlElements = new customElement;

function extractHtmlAndCssBlocks(document: vscode.TextDocument): {
  contentArrayOfHtmlTemplates:Array<{ tag: string; content: string; Pos: positionOfContent }>,
  contentArrayOfCssTemplates:Array<{ tag: string; content: string; Pos: positionOfContent }>
} 
{
  // vs code document text
  const documentText = document.getText();
  // extracted html templates found in documentText
  const htmlTemplates = extractHtmlTemplates(documentText);
  // extracted css templates found in documentText
  const cssTemplates = extractCssTemplates(documentText);
  // Arrays to return
  const contentArrayOfHtmlTemplates: Array<{ tag: string; content: string; Pos: positionOfContent }> = [];
  
  const contentArrayOfCssTemplates: Array<{ tag: string; content: string; Pos: positionOfContent }> = [];

  htmlTemplates.forEach((template, i) => 
    {
    contentArrayOfHtmlTemplates.push({tag: template.tag, 
                                      content: template.content, 
                                      Pos: {startPos: template.startPos, endPos: template.endPos} 
                                  }
                                );
    }
  );
  cssTemplates.forEach((template, i) => 
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


function extractTagWithAttr(templateTag: any): ITagData {
  
  const singleTagData = {} as ITagData;

  const templateTagLocation = templateTag.sourceCodeLocation;

  if (templateTagLocation && templateTag.nodeName !== "#text") {

      singleTagData.name = templateTag.nodeName
      singleTagData.attributes = []
      singleTagData.startOffset = templateTagLocation.startTag?.startOffset ?? templateTagLocation.startOffset
      singleTagData.endOffset = templateTagLocation.startTag?.endOffset ?? templateTagLocation.endOffset
    
  } else {
    console.error(`didn't find a valid html tag, found: ${templateTag.nodeName}`);
  }

  // Attribute + deren Positionen
  if (templateTag.attrs && templateTag.attrs.length > 0) {
    
    for (const attr of templateTag.attrs) {
      
      const nodeChild = templateTagLocation?.attrs?.[attr.name]; // <- positions for this attribute
      
      if (nodeChild) {

        singleTagData.attributes.push(
          {
          name: attr.name,
          startOffset: nodeChild.startTag?.startOffset ?? nodeChild.startOffset,
          endOffset: nodeChild.startTag?.endOffset ?? nodeChild.endOffset
        })
        
      } 
      else {
        console.error(`didn't find a valid html tag, found: ${attr.name}=${JSON.stringify(attr.value)}`);
      }
    }
  }
  return singleTagData;
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
  for (const singleBlockOfHtmlTemplate of HtmlTemplateArray){
    
    // Parsing the found template with relative offsets
    const parsedHtml = ps.parseFragment(singleBlockOfHtmlTemplate?.content, { sourceCodeLocationInfo: true });
    
    for (const node of parsedHtml.childNodes) {
    
      const extractedHtmlContent = extractTagWithAttr(node);
      
      if (validTagNames.has(extractedHtmlContent.name)){
        
        for (const item of extractedHtmlContent.attributes) {
        
          const validAttributeNames = new Set(htmlLanguageService.provideAttributes(
            extractedHtmlContent.name).map(t => t.name))
          
          const customValidAttributeNames = new Set(customHtmlElements.provideAttributes(
            extractedHtmlContent.name).map(t => t.name))

          if( item.name !== "#text" && 
              !validAttributeNames.has(item.name) && 
              !customValidAttributeNames.has(item.name)
            ) {

            const positionOfElement = createPositions( singleBlockOfHtmlTemplate.tag,
                                                  singleBlockOfHtmlTemplate.Pos, 
                                                  item.startOffset,item.endOffset);
            
            const newDiagnostic = new vscode.Diagnostic(
              new vscode.Range(
                document.positionAt(positionOfElement.globalStartOffset),
                document.positionAt(positionOfElement.globalEndOffset)
              ),
              `Attribute ${item.name} is unknown or not valid for ${extractedHtmlContent.name}.`,
              vscode.DiagnosticSeverity.Warning
            );
            diagnosticCollection.push(newDiagnostic);
          }
        }
      }
      else{
        //if(!extractedHtmlContent.name === undefined ){
        const tagPositions = createPositions( singleBlockOfHtmlTemplate.tag,
                                                singleBlockOfHtmlTemplate.Pos, 
                                                extractedHtmlContent.startOffset,extractedHtmlContent.endOffset);
          
        const newDiagnostic = new vscode.Diagnostic(
            new vscode.Range(
              document.positionAt(tagPositions.globalStartOffset),
              document.positionAt(tagPositions.globalEndOffset)
            ),
            `Tag ${extractedHtmlContent.name} is unknown. Check for typos.`,
            vscode.DiagnosticSeverity.Warning
          );
          diagnosticCollection.push(newDiagnostic);
        //}
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