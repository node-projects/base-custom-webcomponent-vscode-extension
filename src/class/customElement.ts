import { IHTMLDataProvider, ITagData, IAttributeData, IValueData } from 'vscode-html-languageservice';

// Eigener Data Provider
class CustomElement implements IHTMLDataProvider {
  private customTags: ITagData[] = [
    {
      name: 'input',
      description: 'Custom web component',
      attributes: [
        { name: '.checked', description: 'Custom attribute' },
        { name: 'a-valid-attribut-for-input', description: 'Custom attribute' }
      ]
    },
    {
      name: 'img',
      description: 'Custom web component',
      attributes: [
        { name: 'a-valid-attribut-for-img', description: 'Custom attribute' }
      ]
    }
  ];

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
    const tagData = this.customTags.find(t => t.name === tag);
    const tagSpecificAttributes = tagData?.attributes || [];
    
    return [
      ...tagSpecificAttributes
    ];
  }
  
  provideValues(tag: string, attribute: string): IValueData[] {
    return [];
  }
}
export { CustomElement };