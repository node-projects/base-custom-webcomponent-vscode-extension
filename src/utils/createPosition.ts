import { GlobalOffsets } from "../interface/GlobalOffsets";
import { PositionOfContent } from "../interface/PositionOfContent";

export function createPositions( 
  templateTag: string,
  templateStartPos: PositionOfContent, 
  startOff: number, endOff: number)
:GlobalOffsets
{ 
  // +1 for the opening backtick of the tag
  const globalStartOffset = startOff + templateStartPos.startOffset + templateTag.length + 1; 
  // +1 for the opening backtick of the tag
  const globalEndOffset = endOff + templateStartPos.startOffset + templateTag.length + 1; 

  return { globalStartOffset, globalEndOffset };  
}