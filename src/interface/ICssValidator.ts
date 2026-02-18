import *as vscode from "vscode"

export interface ICssValidator {
    diagnosticCollection: vscode.Diagnostic[]
    validate():void
}