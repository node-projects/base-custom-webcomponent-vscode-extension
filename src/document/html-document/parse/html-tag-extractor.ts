import { createSourceFile, ScriptTarget } from "typescript";
import { findTaggedTemplates } from "lit-analyzer/lib/analyze/parse/tagged-template/find-tagged-templates.js";
import { ILitDataTemplate } from "../../../interface/ILitDataTemplate";

export function extractHtmlTemplates(code: string):ILitDataTemplate[] { // Changed return types for better handling
  const sourceFile = createSourceFile(
    "temp.ts",
    code,
    ScriptTarget.Latest,
    true
  );

  // Find all html`...` Templates
  const templates = findTaggedTemplates(sourceFile, ["html", "raw"]);
  
  if (!Array.isArray(templates)) {
    return [];
  }

  // Extract every Template Text
  return templates.map(template => {
    const templateText = template.template.getText();
    // Remove the Backticks
    const content = templateText.slice(1, -1);
    
    return {
      fullText: templateText,           // With Backticks: `<div>...</div>`
      content: content,                 // Without Backticks: <div>...</div>
      startPos: template.getStart(),
      endPos: template.getEnd(),
      tag: template.tag.getText()       // "html" or "raw"
    };
  });
}

export function extractCssTemplates(code: string):ILitDataTemplate[] { // Changed return types for better handling
  const sourceFile = createSourceFile(
    "temp.ts",
    code,
    ScriptTarget.Latest,
    true
  );

  // Find all css`...` Templates
  const templates = findTaggedTemplates(sourceFile, ["css"]);
  
  if (!Array.isArray(templates)) {
    return [];
  }

  // Extract every Template Text
  return templates.map(template => {
    const templateText = template.template.getText();
    // Remove the Backticks
    const content = templateText.slice(1, -1);
    
    return {
      fullText: templateText,           // With Backticks: `<div>...</div>`
      content: content,                 // Without Backticks: <div>...</div>
      startPos: template.getStart(),
      endPos: template.getEnd(),
      tag: template.tag.getText()       // css
    };
  });
}