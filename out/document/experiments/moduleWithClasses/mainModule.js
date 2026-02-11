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
const findBlocks_1 = require("./findBlocks");
// Global Properties
const document = vscode.window.activeTextEditor.document;
const errorCollection = vscode.languages.createDiagnosticCollection("myExtension");
const findBlocksInstance = new findBlocks_1.FindBlocks(document);
// Entrypoint for the HTML-Extraction
function extractHtmlText() {
    const diagnosticCollection = [];
    const propertyMap = new Map(); //idee ist eine map hier zu erstellen und durch die funktion findproperties ergebnisse
    // zu erhalten und dann die map zu füllen um sie dann später zu analysieren
    //createText();
    findBlocksInstance.findHtmlBlocks();
    findBlocksInstance.findProperties();
    errorCollection.set(document.uri, diagnosticCollection);
}
function activate(context) {
    const diagnostics = vscode.languages.createDiagnosticCollection("myExtension");
    context.subscriptions.push(diagnostics);
    const timers = new Map();
    const schedule = (doc) => {
        const key = doc.uri.toString();
        const prev = timers.get(key);
        if (prev)
            clearTimeout(prev);
        timers.set(key, setTimeout(() => { extractHtmlText(); timers.delete(key); }, 200));
    };
    context.subscriptions.push(
    //vscode.workspace.onDidOpenTextDocument((doc) => extractHtmlText()),
    vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document)), vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri)));
    const disposable = vscode.commands.registerCommand("helloworld.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World (Validation aktiv)!");
        const editor = vscode.window.activeTextEditor;
        if (editor)
            extractHtmlText();
    });
    const editor = vscode.window.activeTextEditor;
    context.subscriptions.push(disposable);
}
;
function deactivate() { }
// function createText(): void {
//   const mapOfMyCharactersAndPositions = new Map<number, informationOfBrackets>();
//   for (let offset = 0; offset < document.getText().length; offset++) {
//     mapOfMyCharactersAndPositions.set(offset, 
//       {charText: document.getText().slice(offset, offset + 1),
//       offset: offset,
//     });
//   }
//   for (var [runner, value] of mapOfMyCharactersAndPositions) {
//     const key = runner;
//     var offset = value.offset;
//     if (offset > document.getText().length) {
//       offset = document.getText().length - 1;
//     }
//   }
// }
//# sourceMappingURL=mainModule.js.map