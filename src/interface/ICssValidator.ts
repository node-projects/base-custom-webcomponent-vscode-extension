import type { Diagnostic } from "vscode";

export interface ICssValidator {
    diagnosticCollection: Diagnostic[]
    validate():void
}