import { extractCssTemplates } from '../document/html-document/parse/html-tag-extractor';
import { CssTagTemplate } from '../interface/ICssTemplate';
import { window } from "vscode";
import type { TextDocument} from "vscode";
import { ILitDataTemplate } from "../interface/ILitDataTemplate";

export function extractCssTemplateBlock(document: TextDocument):Array<{ cssTemplate: CssTagTemplate }>| undefined{

  const cssTemplates = extractCssTemplates(document.getText());
  
  const contentArrayOfCssTemplates: Array<{ cssTemplate: CssTagTemplate }> = [];
  
  addElement(cssTemplates,contentArrayOfCssTemplates)
  
  if (contentArrayOfCssTemplates.length === 0){
    
    window.showErrorMessage(`didn't find a valid css or html template tag`)
    
    return undefined
  }

  return contentArrayOfCssTemplates;
}

function addElement(cssTemplates:ILitDataTemplate[],contentArrayOfCssTemplates:Array<{ cssTemplate: CssTagTemplate }>){
  cssTemplates.forEach((template, i) => 
    {
    contentArrayOfCssTemplates.push({
      cssTemplate:{
      tag: template.tag, 
      content: template.content, 
      pos: {startOffset: template.startPos, endOffset: template.endPos}}});
    }
  );
}