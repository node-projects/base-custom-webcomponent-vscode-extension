import { IHTMLDataProvider, ITagData, IAttributeData, IValueData } from 'vscode-html-languageservice';
import * as vscode from "vscode"

type CustomTagSetting = {
  name: string;
  description?: string;
  attributes?: Array<{ name: string; description?: string }>;
};

function normalizeCustomTags(raw: unknown): ITagData[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((t): t is CustomTagSetting => !!t && typeof (t as any).name === "string")
    .map((t) => {
      const attributesRaw = Array.isArray(t.attributes) ? t.attributes : [];
      const attributes: IAttributeData[] = attributesRaw
        .filter((a) => a && typeof (a as any).name === "string")
        .map((a) => ({
          name: String(a.name),
          description: typeof a.description === "string" ? a.description : ""
        }));

      return {
        name: String(t.name),
        description: typeof t.description === "string" ? t.description : "",
        attributes
      };
    });
}

function mergeTagsByName(defaults: ITagData[], user: ITagData[]): ITagData[] {
  const map = new Map<string, ITagData>();
  for (const t of defaults) map.set(t.name, t);
  for (const t of user) map.set(t.name, t); // user überschreibt defaults bei gleichem Namen
  return [...map.values()];
}
// Eigener Data Provider
class CustomElement implements IHTMLDataProvider {
  
  private customTags: ITagData[];
  
  constructor(userConfig?: vscode.WorkspaceConfiguration) {
      const cfg = userConfig ?? vscode.workspace.getConfiguration("html-css-template-validator");
      const raw = cfg.get<unknown>("customTags", []);
      this.customTags = normalizeCustomTags(raw);
  }

  getId(): string {
    return 'custom-html-provider';
  }

  isApplicable(languageId: string): boolean {
    return languageId === 'html' || languageId === 'typescript' || languageId === 'javascript';
  }

  provideTags(): ITagData[] {
    return this.customTags
  }

  provideAttributes(tag: string): IAttributeData[] {
    return this.customTags.find((t) => t.name === tag)?.attributes ?? [];
  }
  
  provideValues(tag: string, attribute: string): IValueData[] {
    return [];
  }
}
export { CustomElement };