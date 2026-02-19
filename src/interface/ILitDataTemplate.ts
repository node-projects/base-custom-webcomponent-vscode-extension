export interface ILitDataTemplate{
    fullText: string,           // Mit Backticks: `<div>...</div>`
    content: string,                 // Ohne Backticks: <div>...</div>
    startPos: number,
    endPos: number,
    tag: string
}