import * as ts from "typescript";
import { findTaggedTemplates } from "lit-analyzer/lib/analyze/parse/tagged-template/find-tagged-templates.js";
import { parseHtmlDocument } from "lit-analyzer/lib/analyze/parse/document/text-document/html-document/parse-html-document.js";

export function extractHtmlTags(code: string) {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const templates = findTaggedTemplates(sourceFile, ["html", "raw"]);
  
  if (!Array.isArray(templates)) {
    return [];
  }

  const results: any[] = [];
  
  templates.forEach(template => {
    const htmlDoc = parseHtmlDocument(template);
    
    htmlDoc.rootNodes.forEach(node => {
      results.push({
        tagName: node.tagName,
        attributes: node.attributes.map(a => a.name),
        children: node.children?.map(c => c.tagName) || []
      });
    });
  });
  
  return results;
}