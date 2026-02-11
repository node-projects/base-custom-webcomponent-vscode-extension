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
exports.checkBracketMatching = checkBracketMatching;
const vscode = __importStar(require("vscode"));
const printer_1 = require("./printer");
const createDiagnostic_1 = require("./createDiagnostic");
function checkBracketMatching(positionOfBrackets, diagnostics, document) {
    const stack = [];
    for (let i = 0; i < positionOfBrackets.size; i++) {
        const char = positionOfBrackets.get(i)?.charText;
        if (char === '<' || char === '{' || char === '(' || char === '[') {
            stack.push({ open: char, offset: positionOfBrackets.get(i).offset });
            continue;
        }
        if (stack.length === 0) {
            (0, printer_1.printerror)(document.getText(new vscode.Range(document.positionAt(positionOfBrackets.get(i).offset), document.positionAt(positionOfBrackets.get(i).offset + 1))), positionOfBrackets.get(i).offset, document.positionAt(positionOfBrackets.get(i).offset));
            (0, createDiagnostic_1.createDiagnostic)(diagnostics, `Unnecessary bracket : ${positionOfBrackets.get(i).charText}`, positionOfBrackets.get(i).offset, document);
            continue;
        }
        if ((char === '>' && stack[stack.length - 1].open === '<') ||
            (char === '}' && stack[stack.length - 1].open === '{') ||
            (char === ')' && stack[stack.length - 1].open === '(') ||
            (char === ']' && stack[stack.length - 1].open === '[')) {
            stack.pop();
            continue;
        }
        (0, printer_1.printerror)(document.getText(new vscode.Range(document.positionAt(positionOfBrackets.get(i).offset), document.positionAt(positionOfBrackets.get(i).offset + 1))), positionOfBrackets.get(i).offset, document.positionAt(positionOfBrackets.get(i).offset));
        (0, createDiagnostic_1.createDiagnostic)(diagnostics, `Mismatched closing bracket found: ${positionOfBrackets.get(i).charText}`, positionOfBrackets.get(i).offset, document);
        continue;
    }
    if (stack.length > 0) {
        for (let j = 0; j < stack.length; j++) {
            const unclosedBracket = stack[j].open;
            (0, createDiagnostic_1.createDiagnostic)(diagnostics, `Unclosed bracket found: ${unclosedBracket}`, stack[j].offset, document);
            (0, printer_1.printerror)(unclosedBracket, stack[j].offset, document.positionAt(stack[j].offset));
        }
    }
}
//# sourceMappingURL=checkBrackets.js.map