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
exports.createOffsetmapOfBrackets = createOffsetmapOfBrackets;
exports.createPropertiesMap = createPropertiesMap;
const vscode = __importStar(require("vscode"));
function createOffsetmapOfBrackets(htmlTagsPositionResults, document) {
    var runnerForMapIndex = 0;
    const offsetsOfBracketsMap = new Map();
    for (let i = htmlTagsPositionResults[0]; i < htmlTagsPositionResults[1]; i++) {
        const charAtPositioni = document.getText(new vscode.Range(document.positionAt(i), document.positionAt(i + 1)));
        if (charAtPositioni === '<' || charAtPositioni === '>' || charAtPositioni === '{' ||
            charAtPositioni === '}' || charAtPositioni === '(' || charAtPositioni === ')' ||
            charAtPositioni === '[' || charAtPositioni === ']') {
            offsetsOfBracketsMap.set(runnerForMapIndex, { charText: charAtPositioni, offset: i });
            runnerForMapIndex++;
        }
    }
    return offsetsOfBracketsMap;
}
function createPropertiesMap(htmlTagsPositionResults, document) {
    // console.log(document.getText(new vscode.Range(document.positionAt(htmlTagsPositionResults[0]),document.positionAt(htmlTagsPositionResults[1]))));
    const offsetsOfPropertiesMap = new Map();
    var runnerForMapIndex = 0;
    // to be implemented
    while (htmlTagsPositionResults.length > 0) {
        offsetsOfPropertiesMap.set(runnerForMapIndex, { propertyName: document.getText(new vscode.Range(document.positionAt(htmlTagsPositionResults[0]), document.positionAt(htmlTagsPositionResults[1]))),
            startingOffset: htmlTagsPositionResults[0],
            endingOffset: htmlTagsPositionResults[1] });
        htmlTagsPositionResults.pop();
        htmlTagsPositionResults.pop();
        runnerForMapIndex++;
    }
    return offsetsOfPropertiesMap;
}
//# sourceMappingURL=mapCreater.js.map