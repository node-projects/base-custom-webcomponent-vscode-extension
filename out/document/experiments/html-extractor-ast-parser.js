"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractHtmlWithPositions = extractHtmlWithPositions;
const ts = __importStar(require("typescript"));
const find_tagged_templates_js_1 = require("lit-analyzer/lib/analyze/parse/tagged-template/find-tagged-templates.js");
const parse_html_document_js_1 = require("lit-analyzer/lib/analyze/parse/document/text-document/html-document/parse-html-document.js");
function extractHtmlWithPositions(code) {
    const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true);
    // 1. Finde alle html`...` Templates
    const templates = (0, find_tagged_templates_js_1.findTaggedTemplates)(sourceFile, ["html", "raw"]);
    if (!Array.isArray(templates)) {
        return [];
    }
    const results = [];
    // 2. Parse jedes Template mit AST
    templates.forEach((template, templateIndex) => {
        const htmlDoc = (0, parse_html_document_js_1.parseHtmlDocument)(template);
        // 3. Extrahiere alle Tags mit Positionen
        const tags = [];
        function extractNode(node, depth = 0) {
            tags.push({
                tagName: node.tagName,
                depth: depth,
                position: {
                    // Position INNERHALB des html`...` Templates
                    start: node.location.start,
                    end: node.location.end,
                    // Position der Start- und End-Tags
                    startTag: {
                        start: node.location.startTag.start,
                        end: node.location.startTag.end
                    },
                    endTag: node.location.endTag ? {
                        start: node.location.endTag.start,
                        end: node.location.endTag.end
                    } : null
                },
                attributes: node.attributes.map((attr) => ({
                    name: attr.name,
                    value: attr.assignment?.value,
                    position: {
                        start: attr.location.start,
                        end: attr.location.end
                    }
                })),
                // Hole den tatsächlichen HTML-Text
                htmlText: node.document.virtualDocument.text.substring(node.location.start, node.location.end)
            });
            // Rekursiv durch Kinder
            if (node.children) {
                node.children.forEach((child) => extractNode(child, depth + 1));
            }
        }
        htmlDoc.rootNodes.forEach(node => extractNode(node));
        results.push({
            templateIndex: templateIndex,
            templateTag: template.tag.getText(),
            // Position des gesamten html`...` im TypeScript-Code
            templatePosition: {
                start: template.getStart(),
                end: template.getEnd()
            },
            // Alle Tags im Template mit ihren Positionen
            tags: tags
        });
    });
    return results;
}
//# sourceMappingURL=html-extractor-ast-parser.js.map