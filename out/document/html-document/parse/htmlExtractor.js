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
exports.extractHtmlTags = extractHtmlTags;
const ts = __importStar(require("typescript"));
const find_tagged_templates_js_1 = require("lit-analyzer/lib/analyze/parse/tagged-template/find-tagged-templates.js");
const parse_html_document_js_1 = require("lit-analyzer/lib/analyze/parse/document/text-document/html-document/parse-html-document.js");
function extractHtmlTags(code) {
    const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true);
    const templates = (0, find_tagged_templates_js_1.findTaggedTemplates)(sourceFile, ["html", "raw"]);
    if (!Array.isArray(templates)) {
        return [];
    }
    const results = [];
    templates.forEach(template => {
        const htmlDoc = (0, parse_html_document_js_1.parseHtmlDocument)(template);
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
//# sourceMappingURL=htmlExtractor.js.map