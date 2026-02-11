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
exports.extractHtmlTemplates = extractHtmlTemplates;
exports.extractCssTemplates = extractCssTemplates;
const ts = __importStar(require("typescript"));
const find_tagged_templates_js_1 = require("lit-analyzer/lib/analyze/parse/tagged-template/find-tagged-templates.js");
function extractHtmlTemplates(code) {
    const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true);
    // Finde alle html`...` Templates
    const templates = (0, find_tagged_templates_js_1.findTaggedTemplates)(sourceFile, ["html", "raw"]);
    if (!Array.isArray(templates)) {
        return [];
    }
    // Extrahiere den Text jedes Templates
    return templates.map(template => {
        const templateText = template.template.getText();
        // Entferne die umgebenden Backticks
        const content = templateText.slice(1, -1);
        return {
            fullText: templateText, // Mit Backticks: `<div>...</div>`
            content: content, // Ohne Backticks: <div>...</div>
            startPos: template.getStart(),
            endPos: template.getEnd(),
            tag: template.tag.getText() // "html" oder "raw"
        };
    });
}
function extractCssTemplates(code) {
    const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true);
    // Finde alle html`...` Templates
    const templates = (0, find_tagged_templates_js_1.findTaggedTemplates)(sourceFile, ["css", "raw"]);
    if (!Array.isArray(templates)) {
        return [];
    }
    // Extrahiere den Text jedes Templates
    return templates.map(template => {
        const templateText = template.template.getText();
        // Entferne die umgebenden Backticks
        const content = templateText.slice(1, -1);
        return {
            fullText: templateText, // Mit Backticks: `<div>...</div>`
            content: content, // Ohne Backticks: <div>...</div>
            startPos: template.getStart(),
            endPos: template.getEnd(),
            tag: template.tag.getText() // "html" oder "raw"
        };
    });
}
//# sourceMappingURL=html-tag-extractor.js.map