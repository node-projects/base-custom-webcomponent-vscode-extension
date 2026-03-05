export interface TextDocument {
    /**
     * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
     * represent files on disk. However, some documents may have other schemes indicating that they are not
     * available on disk.
     *
     * @readonly
     */
    readonly uri: DocumentUri;
    /**
     * The identifier of the language associated with this document.
     *
     * @readonly
     */
    readonly languageId: string;
    /**
     * The version number of this document (it will increase after each
     * change, including undo/redo).
     *
     * @readonly
     */
    readonly version: number;
    /**
     * Get the text of this document. A substring can be retrieved by
     * providing a range.
     *
     * @param range (optional) An range within the document to return.
     * If no range is passed, the full content is returned.
     * Invalid range positions are adjusted as described in {@link Position.line}
     * and {@link Position.character}.
     * If the start range position is greater than the end range position,
     * then the effect of getText is as if the two positions were swapped.

     * @return The text of this document or a substring of the text if a
     *         range is provided.
     */
    getText(range?: Range): string;
    /**
     * Converts a zero-based offset to a position.
     *
     * @param offset A zero-based offset.
     * @return A valid {@link Position position}.
     * @example The text document "ab\ncd" produces:
     * * position { line: 0, character: 0 } for `offset` 0.
     * * position { line: 0, character: 1 } for `offset` 1.
     * * position { line: 0, character: 2 } for `offset` 2.
     * * position { line: 1, character: 0 } for `offset` 3.
     * * position { line: 1, character: 1 } for `offset` 4.
     */
    positionAt(offset: number): Position;
    /**
     * Converts the position to a zero-based offset.
     * Invalid positions are adjusted as described in {@link Position.line}
     * and {@link Position.character}.
     *
     * @param position A position.
     * @return A valid zero-based offset.
     */
    offsetAt(position: Position): number;
    /**
     * The number of lines in this document.
     *
     * @readonly
     */
    readonly lineCount: number;
}

export type DocumentUri = string;

export interface Position {
    /**
     * Line position in a document (zero-based).
     *
     * If a line number is greater than the number of lines in a document, it
     * defaults back to the number of lines in the document.
     * If a line number is negative, it defaults to 0.
     *
     * The above two properties are implementation specific.
     */
    line: number;
    /**
     * Character offset on a line in a document (zero-based).
     *
     * The meaning of this offset is determined by the negotiated
     * `PositionEncodingKind`.
     *
     * If the character value is greater than the line length it defaults back
     * to the line length. This property is implementation specific.
     */
    character: number;
}