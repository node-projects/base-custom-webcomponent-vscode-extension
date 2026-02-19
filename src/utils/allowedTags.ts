export class TagContext {
    static ALLOWED_TAGS = new Set<string>([ // in lit plugin suchen, da wird eine funktion verwendet die alle html tags zurück gibt
".checked","ichbinungultig"
]);

   isAllowed(tag: string): boolean {
    return TagContext.ALLOWED_TAGS.has(tag.toLowerCase());
  }

  getAll(): string[] {
    return Array.from(TagContext.ALLOWED_TAGS);
  }
}
