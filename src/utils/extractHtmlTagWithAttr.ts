import {ITagData} from "../interface/ITagData"
import * as vscode from "vscode"
import {createTagData} from "./createTagData"

export function extractHtmlTagWithAttr(templateTag: any): ITagData {
  
  const singleTagData = {} as ITagData;

  const templateTagLocation = templateTag.sourceCodeLocation;

  if (templateTagLocation && templateTag.nodeName !== "#text") {
    createTagData(singleTagData,templateTag)
    
  } else {
    vscode.window.showErrorMessage(`didn't find a valid html tag, found: ${templateTag.nodeName}`)
    createTagData(singleTagData,templateTag)
  }

  // Attribute + deren Positionen
  if (templateTag.attrs && templateTag.attrs.length > 0) {
    
    for (const attr of templateTag.attrs) {
      
      const nodeChild = templateTagLocation?.attrs?.[attr.name]; // positions for this attribute
      
      if (nodeChild) {

        singleTagData.attributes.push(
          {
          name: attr.name,
          startOffset: nodeChild.startTag?.startOffset ?? nodeChild.startOffset,
          endOffset: nodeChild.startTag?.endOffset ?? nodeChild.endOffset
          }
        )
      } 
      else {
        vscode.window.showErrorMessage(`didn't find a valid html tag, found: ${attr.name}=${JSON.stringify(attr.value)}`)
      }
    }
  }
  return singleTagData;
}