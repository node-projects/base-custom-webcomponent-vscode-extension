import { TextDocument, DiagnosticSeverity} from "vscode";
import type { Diagnostic as DiagnosticType }  from "vscode";
import { Diagnostic,Range } from "vscode";

export function createVscodeDiagnostic(
  globalStartOffset:number, 
  globalEndOffset: number, 
  diagnosticMessage: string, 
  diagnosticSeverity: DiagnosticSeverity,
  document: TextDocument
):DiagnosticType{
                                  
    const newDiagnostic = new Diagnostic(
    new Range(
      document.positionAt(globalStartOffset),
      document.positionAt(globalEndOffset)
    ),
    diagnosticMessage,
    diagnosticSeverity
  );
  return newDiagnostic
}