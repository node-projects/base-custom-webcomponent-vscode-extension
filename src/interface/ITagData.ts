export interface ITagData {
    name: string;
    attributes: IAttributeData[];
    startOffset: number;
    endOffset: number;
}
export interface IAttributeData {
    name: string;
    startOffset: number;
    endOffset: number;
}
export interface IValueData {
    name: string;
}