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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const html_tag_extractor_1 = require("./document/html-document/parse/html-tag-extractor");
const internalPrinter_1 = require("./internalPrinter");
//import type { DefaultTreeAdapterMap } from "parse5" with { "resolution-mode": "import" };
//import { getLanguageService, TextDocument } from 'vscode-html-languageservice';
const node_html_parser_1 = require("node-html-parser");
//import { HtmlNode } from "lit-analyzer/lib/analyze/types/html-node/html-node-types";
//import type { Node as HtmlParserNode } from "node-html-parser";
//import { HTMLElement } from "node-html-parser";
const allowed_tags_1 = require("./utils/allowed-tags");
//import arrayToTree from "performant-array-to-tree";
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");
const document = vscode.window.activeTextEditor.document;
const tagContext = new allowed_tags_1.TagContext();
function extractHtmlAndCssBlocks() {
    const text = document.getText();
    const templatesHtml = (0, html_tag_extractor_1.extractHtmlTemplates)(text);
    const templatesCss = (0, html_tag_extractor_1.extractCssTemplates)(text);
    const contentArrayOfHtmlTemplates = [];
    const contentArrayOfCssTemplates = [];
    templatesHtml.forEach((template, i) => {
        contentArrayOfHtmlTemplates.push({ tag: template.tag,
            content: template.content,
            Pos: { startPos: template.startPos, endPos: template.endPos }
        });
        (0, internalPrinter_1.printInternalMessage)(document.positionAt(template.startPos), document.getText(new vscode.Range(document.positionAt(template.startPos), document.positionAt(template.startPos + 1))), template.content);
    });
    templatesCss.forEach((template, i) => {
        (0, internalPrinter_1.printInternalMessage)(document.positionAt(template.startPos), document.getText(new vscode.Range(document.positionAt(template.startPos), document.positionAt(template.startPos + 1))), template.content);
    });
    return { contentArrayOfCssTemplates: contentArrayOfCssTemplates, contentArrayOfHtmlTemplates: contentArrayOfHtmlTemplates };
}
function traverseNode(node, depth = 0, offsetsOfPropertiesMap = new Map(), indexCounter = { value: 0 }) {
    //nur vorübergehend
    const indent = " ".repeat(depth * 2);
    const vscodePositionStyle = node.sourceCodeLocation;
    if (vscodePositionStyle && node.nodeName !== "#text") {
        console.log(`${node.nodeName} [${vscodePositionStyle.startLine}, ${vscodePositionStyle.startCol}] - [${vscodePositionStyle.endLine}, ${vscodePositionStyle.endCol}]`);
        offsetsOfPropertiesMap.set(indexCounter.value++, {
            propertyName: node.nodeName,
            positions: {
                startCol: vscodePositionStyle.startTag?.startCol ?? vscodePositionStyle.startCol,
                startLine: vscodePositionStyle.startTag?.startLine ?? vscodePositionStyle.startLine,
                endCol: vscodePositionStyle.startTag?.endCol ?? vscodePositionStyle.endCol,
                endLine: vscodePositionStyle.startTag?.endLine ?? vscodePositionStyle.endCol
            }
        });
        if (vscodePositionStyle.endTag) {
            const start = new vscode.Position(vscodePositionStyle.endTag.startLine, vscodePositionStyle.endTag.startCol);
            const end = new vscode.Position(vscodePositionStyle.endTag.endLine, vscodePositionStyle.endTag.endCol - 2);
            const propertyNameFromTheDocument = document.getText(new vscode.Range(start, end));
            offsetsOfPropertiesMap.set(indexCounter.value++, {
                propertyName: propertyNameFromTheDocument,
                positions: {
                    startCol: vscodePositionStyle.endTag?.startCol ?? vscodePositionStyle.startCol,
                    startLine: vscodePositionStyle.endTag?.startLine ?? vscodePositionStyle.startLine,
                    endCol: vscodePositionStyle.endTag?.endCol ?? vscodePositionStyle.endCol,
                    endLine: vscodePositionStyle.endTag?.endLine ?? vscodePositionStyle.endCol
                }
            });
        }
        ;
    }
    else {
        console.log(`${node.nodeName}`);
    }
    // Attribute + deren Positionen
    if (node.attrs && node.attrs.length > 0) {
        for (const attr of node.attrs) {
            const childVscodePositionStyle = vscodePositionStyle?.attrs?.[attr.name]; // <- positions for this attribute
            if (childVscodePositionStyle) {
                console.log(`${attr.name}=${JSON.stringify(attr.value)} ` +
                    `[${childVscodePositionStyle.startLine}, ${childVscodePositionStyle.startCol}] - [${childVscodePositionStyle.endLine}, ${childVscodePositionStyle.endCol}]`);
                offsetsOfPropertiesMap.set(indexCounter.value++, {
                    propertyName: attr.name,
                    positions: {
                        startCol: childVscodePositionStyle.startTag?.startCol ?? childVscodePositionStyle.startCol,
                        startLine: childVscodePositionStyle.startTag?.startLine ?? childVscodePositionStyle.startLine,
                        endCol: childVscodePositionStyle.startTag?.endCol ?? childVscodePositionStyle.endCol,
                        endLine: childVscodePositionStyle.startTag?.endLine ?? childVscodePositionStyle.endLine
                    }
                });
            }
            if (childVscodePositionStyle.endTag) {
                const start = new vscode.Position(childVscodePositionStyle.endTag.startLine, childVscodePositionStyle.endTag.startCol);
                const end = new vscode.Position(childVscodePositionStyle.endTag.endLine, childVscodePositionStyle.endTag.endCol - 1);
                const propertyNameFromTheDocument = document.getText(new vscode.Range(start, end));
                offsetsOfPropertiesMap.set(indexCounter.value++, {
                    propertyName: propertyNameFromTheDocument,
                    positions: {
                        startCol: childVscodePositionStyle.endTag?.startCol ?? childVscodePositionStyle.startCol,
                        startLine: childVscodePositionStyle.endTag?.startLine ?? childVscodePositionStyle.startLine,
                        endCol: childVscodePositionStyle.endTag?.endCol ?? childVscodePositionStyle.endCol,
                        endLine: childVscodePositionStyle.endTag?.endLine ?? childVscodePositionStyle.endCol
                    }
                });
            }
            else {
                console.log(`${attr.name}=${JSON.stringify(attr.value)}`);
            }
        }
    }
    // Kinder
    if (node.childNodes) {
        for (const child of node.childNodes)
            traverseNode(child, depth + 1, offsetsOfPropertiesMap, indexCounter);
    }
    return offsetsOfPropertiesMap;
}
function diagnosticPrinter(offsetsOfPropertiesMap) {
    const diagnosticCollection = []; // wenn ich /div falsch schreibe dann kommt kein fehler
    for (const [index, informationOfBrackets] of offsetsOfPropertiesMap) {
        if (!tagContext.isAllowed(informationOfBrackets.propertyName) && informationOfBrackets.propertyName !== "#text") {
            const diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(informationOfBrackets.positions.startLine, informationOfBrackets.positions.startCol), new vscode.Position(informationOfBrackets.positions.endLine, informationOfBrackets.positions.endCol)), `Propertie ${informationOfBrackets.propertyName} is unknown.`, vscode.DiagnosticSeverity.Warning);
            diagnosticCollection.push(diagnostic);
        }
    }
    errorCollection.set(document.uri, diagnosticCollection);
}
async function activate(context) {
    const ps = await import("parse5");
    const offsetsOfPropertiesMap = new Map();
    const diagnostics = vscode.languages.createDiagnosticCollection("myExtension");
    context.subscriptions.push(diagnostics);
    //errorCollection.set(document.uri, diagnosticCollection);
    var templates;
    var informationOfCssTemplates;
    var informationOfHtmlTemplates;
    const disposable = vscode.commands.registerCommand("helloworld.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World (Validation aktiv)!");
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const timers = new Map();
            const schedule = (doc) => {
                const key = doc.uri.toString();
                const prev = timers.get(key);
                if (prev)
                    clearTimeout(prev);
                timers.set(key, setTimeout(() => {
                    templates = extractHtmlAndCssBlocks();
                    informationOfCssTemplates = templates.contentArrayOfCssTemplates;
                    informationOfHtmlTemplates = templates.contentArrayOfHtmlTemplates;
                    const root = (0, node_html_parser_1.parse)(informationOfHtmlTemplates[0]?.content);
                    const root2 = (0, node_html_parser_1.parse)(informationOfHtmlTemplates[1]?.content);
                    const astofhtml = ps.parseFragment(informationOfHtmlTemplates[0]?.content, { sourceCodeLocationInfo: true });
                    const allProperties = traverseNode(astofhtml);
                    diagnosticPrinter(allProperties);
                    console.log("");
                }));
            };
            context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document)));
        }
    });
    context.subscriptions.push(disposable);
}
;
function deactivate() { }
//# sourceMappingURL=extension.js.map