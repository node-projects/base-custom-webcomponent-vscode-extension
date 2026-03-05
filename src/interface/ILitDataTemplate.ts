export interface ILitDataTemplate{
    fullText: string,           // With Backticks: `<div>...</div>`
    content: string,                 // Without Backticks: <div>...</div>
    startPos: number,
    endPos: number,
    tag: string
}