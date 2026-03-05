import {ITagData} from "../interface/ITagData"

export function createTagData(tagData: ITagData,templateTag: any):void{
  tagData.name = templateTag.nodeName
  tagData.attributes = []
  tagData.startOffset = templateTag.sourceCodeLocation.startTag?.startOffset ?? templateTag.sourceCodeLocation.startOffset
  tagData.endOffset = templateTag.sourceCodeLocation.startTag?.endOffset ?? templateTag.sourceCodeLocation.endOffset
}