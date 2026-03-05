import { HtmlTagTemplate } from "../interface/IHtmlTemplate";
import * as vscode from "vscode"

export interface IHtmlValidator{
    diagnosticCollection: vscode.Diagnostic[];
    validate(htmlTemplateArray: Array<{ htmlTemplate: HtmlTagTemplate }>): void
}