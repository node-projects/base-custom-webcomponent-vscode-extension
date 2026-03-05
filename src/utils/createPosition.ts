import { GlobalOffsets } from "../interface/IGlobalOffsets";
import { PositionOfContent } from "../interface/IPositionOfContent";

export function createPositions( 
  templateTag: string,
  templateStartPos: PositionOfContent, 
  startOff: number, endOff: number):GlobalOffsets
{ 
  // +1 for the opening backtick of the tag
  const globalStartOffset = startOff + templateStartPos.startOffset + templateTag.length + 1; 
  // +1 for the opening backtick of the tag
  const globalEndOffset = endOff + templateStartPos.startOffset + templateTag.length + 1; 

  return { globalStartOffset, globalEndOffset };  
}