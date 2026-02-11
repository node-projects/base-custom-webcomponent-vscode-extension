import * as ts from "typescript";
import { findTaggedTemplates } from "lit-analyzer/lib/analyze/parse/tagged-template/find-tagged-templates.js";

export function extractHtmlTemplates(code: string) {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  // Finde alle html`...` Templates
  const templates = findTaggedTemplates(sourceFile, ["html", "raw"]);
  
  if (!Array.isArray(templates)) {
    return [];
  }

  // Extrahiere den Text jedes Templates
  return templates.map(template => {
    const templateText = template.template.getText();
    // Entferne die umgebenden Backticks
    const content = templateText.slice(1, -1);
    
    return {
      fullText: templateText,           // Mit Backticks: `<div>...</div>`
      content: content,                 // Ohne Backticks: <div>...</div>
      startPos: template.getStart(),
      endPos: template.getEnd(),
      tag: template.tag.getText()       // "html" oder "raw"
    };
  });
}

export function extractCssTemplates(code: string) {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  // Finde alle html`...` Templates
  const templates = findTaggedTemplates(sourceFile, ["css", "raw"]);
  
  if (!Array.isArray(templates)) {
    return [];
  }

  // Extrahiere den Text jedes Templates
  return templates.map(template => {
    const templateText = template.template.getText();
    // Entferne die umgebenden Backticks
    const content = templateText.slice(1, -1);
    
    return {
      fullText: templateText,           // Mit Backticks: `<div>...</div>`
      content: content,                 // Ohne Backticks: <div>...</div>
      startPos: template.getStart(),
      endPos: template.getEnd(),
      tag: template.tag.getText()       // "html" oder "raw"
    };
  });
}