import { extractHtmlTemplates } from '../document/html-document/parse/html-tag-extractor';
import { HtmlTagTemplate } from "../interface/IHtmlTemplate";
import * as vscode from "vscode"
import { ILitDataTemplate } from "../interface/ILitDataTemplate";

export function extractHtmlTemplateBlock(document: vscode.TextDocument):Array<{ htmlTemplate: HtmlTagTemplate }>| undefined{
    
  const htmlTemplates = extractHtmlTemplates(document.getText());
    
    const contentArrayOfHtmlTemplates: Array<{ htmlTemplate: HtmlTagTemplate }> = [];
    
    addElement(htmlTemplates,contentArrayOfHtmlTemplates)
    
    if (contentArrayOfHtmlTemplates.length === 0){
      
      vscode.window.showErrorMessage(`didn't find a valid css or html template tag`)
      
      return undefined
    }
    
    return contentArrayOfHtmlTemplates
}

function addElement(htmlTemplates:ILitDataTemplate[],contentArrayOfHtmlTemplates:Array<{ htmlTemplate: HtmlTagTemplate }>){
  htmlTemplates.forEach((template, i) => 
    {
    contentArrayOfHtmlTemplates.push({
      htmlTemplate:{
      tag: template.tag, 
      content: template.content, 
      pos: {startOffset: template.startPos, endOffset: template.endPos}}});
    }
  );
}