import * as vscode from "vscode";
import * as htmlService from "vscode-html-languageservice";
import {ITagData} from "../interface/tagData"
import { CustomElement } from "../class/customElement";
import { HtmlTagTemplate } from "../interface/IHtmlTemplate";
import {extractHtmlTagWithAttr} from "../utils/extractHtmlTagWithAttr"
import { createPositions } from "../utils/createPosition";
import { createVscodeDiagnostic } from "../utils/createVscodeDiagnostic";
import { IHtmlValidator } from "../interface/IHtmlValidator";

type Parse5 = typeof import("parse5", { with: { "resolution-mode": "import" } });
const htmlLanguageService = htmlService.getDefaultHTMLDataProvider();
const customHtmlElements = new CustomElement();

export class HtmlValidator implements IHtmlValidator {
  
  private validTagNames: Set<string>;
  private ps: Parse5;
  private document: vscode.TextDocument;
  diagnosticCollection: vscode.Diagnostic[];

  constructor(ps: Parse5,document: vscode.TextDocument,diagnosticCollection: vscode.Diagnostic[]) {
    this.ps = ps;
    this.document = document;
    this.diagnosticCollection = diagnosticCollection;
    this.validTagNames = new Set(htmlLanguageService.provideTags().map(t => t.name));
  }

  validate(htmlTemplateArray: Array<{ htmlTemplate: HtmlTagTemplate }>): void {
    for (const template of htmlTemplateArray) {
      this.validateTemplate(template);
    }
  }

  private validateTemplate(template: { htmlTemplate: HtmlTagTemplate }): void {
    const parsedHtml = this.ps.parseFragment(
      template.htmlTemplate.content,
      { sourceCodeLocationInfo: true }
    );

    for (const node of parsedHtml.childNodes) {
      this.validateNode(node, template);
    }
  }

  private validateNode(node: any, template: { htmlTemplate: HtmlTagTemplate }): void {
    const tagData = extractHtmlTagWithAttr(node);

    if (this.isValidTag(tagData.name)) {
      this.validateAttributes(tagData, template);
    } else if (tagData.name && tagData.name !== "#text") {
      this.addInvalidTagDiagnostic(tagData, template);
    }
  }

  private isValidTag(tagName: string): boolean {
    return this.validTagNames.has(tagName);
  }

  private validateAttributes(
    tagData: ITagData,
    template: { htmlTemplate: HtmlTagTemplate }
  ): void {
    for (const attribute of tagData.attributes) {
      if (!this.isValidAttribute(attribute.name, tagData.name)) {
        this.addInvalidAttributeDiagnostic(attribute, tagData.name, template);
      }
    }
  }

  private isValidAttribute(attributeName: string, tagName: string): boolean {
    if (attributeName === "#text") return true;

    const validAttributeNames = new Set(
      htmlLanguageService.provideAttributes(tagName).map(t => t.name)
    );
    
    const customValidAttributeNames = new Set(
      customHtmlElements.provideAttributes(tagName).map(t => t.name)
    );

    return validAttributeNames.has(attributeName) || 
           customValidAttributeNames.has(attributeName);
  }

  private addInvalidAttributeDiagnostic(
    attribute: { name: string; startOffset: number; endOffset: number },
    tagName: string,
    template: { htmlTemplate: HtmlTagTemplate }
  ): void {
    const positions = createPositions(
      template.htmlTemplate.tag,
      template.htmlTemplate.pos,
      attribute.startOffset,
      attribute.endOffset
    );

    this.diagnosticCollection.push(
      createVscodeDiagnostic(
        positions.globalStartOffset,
        positions.globalEndOffset,
        `Attribute ${attribute.name} is unknown or not valid for ${tagName}.`,
        vscode.DiagnosticSeverity.Warning,
        this.document
      )
    );
  }

  private addInvalidTagDiagnostic(
    tagData: ITagData,
    template: { htmlTemplate: HtmlTagTemplate }
  ): void {
    const positions = createPositions(
      template.htmlTemplate.tag,
      template.htmlTemplate.pos,
      tagData.startOffset,
      tagData.endOffset
    );

    this.diagnosticCollection.push(
      createVscodeDiagnostic(
        positions.globalStartOffset,
        positions.globalEndOffset,
        `Tag ${tagData.name} is unknown. Check for typos.`,
        vscode.DiagnosticSeverity.Warning,
        this.document
      )
    );
  }
}