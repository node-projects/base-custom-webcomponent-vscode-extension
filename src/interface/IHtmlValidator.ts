import { HtmlTagTemplate } from "../interface/IHtmlTemplate";

export interface IHtmlValidator{
    validate(htmlTemplateArray: Array<{ htmlTemplate: HtmlTagTemplate }>): void
}