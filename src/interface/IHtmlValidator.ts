import { HtmlTagTemplate } from "../interface/IHtmlTemplate";
import type { Diagnostic } from "vscode";

export interface IHtmlValidator{
    diagnosticCollection: Diagnostic[];
    validate(htmlTemplateArray: Array<{ htmlTemplate: HtmlTagTemplate }>): void
}