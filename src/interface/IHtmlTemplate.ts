import { PositionOfContent } from "./IPositionOfContent";
export interface HtmlTagTemplate {
    tag: string; 
    content: string; 
    pos: PositionOfContent
}