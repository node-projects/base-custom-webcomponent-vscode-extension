import * as vscode from "vscode"

export function createVscodeDiagnostic(
  globalStartOffset:number, 
  globalEndOffset: number, 
  diagnosticMessage: string, 
  diagnosticSeverity: vscode.DiagnosticSeverity,
  document: vscode.TextDocument
):vscode.Diagnostic{
                                  
    const newDiagnostic = new vscode.Diagnostic(
    new vscode.Range(
      document.positionAt(globalStartOffset),
      document.positionAt(globalEndOffset)
    ),
    diagnosticMessage,
    diagnosticSeverity
  );
  return newDiagnostic
}