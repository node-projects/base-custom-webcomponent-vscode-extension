import { CssTagTemplate } from "./ICssTemplate"
import *as vscode from "vscode"
import * as cssService from "vscode-css-languageservice"

export interface ICssValidator {
    validate(CssTemplateArray: Array<{ cssTemplate: CssTagTemplate }>,
      document: vscode.TextDocument,
      diagnosticCollection: vscode.Diagnostic[],
      cssLanguageService:cssService.LanguageService
    ):void
}