# Lit-HTML & Styled Components Extension

A VS Code extension that provides syntax highlighting and diagnostic features for lit-html templates and styled-components in JavaScript/TypeScript projects.
This project builds on the Base-Custom-Components project.

## Features

### Syntax Highlighting

The extension provides comprehensive syntax highlighting for:

- **lit-html Templates**: HTML syntax within template strings
- **CSS in lit-html**: CSS blocks in `<style>` tags within lit-html templates
- **Styled Components**: CSS syntax in styled-components for JavaScript/TypeScript

### Supported File Types

Syntax highlighting is activated for the following file types:
-JavaScript (`.js`, `.jsx`)
-TypeScript (`.ts`, `.tsx`)
-HTML (`.html`)

### Template-Extraction

The extension automatically analyzes:
-HTML template literals in JavaScript/TypeScript
-CSS template literals in styled-components

```typescript
static templatef = html`
    <div>[[this.bb]]</div> 
    <input type="checkbox" .checked="{{this.ee}}">Value: [[this.ee]]
    <div>[[this.bb]]</div>
  `;
static style = css`
    :host {
        font-size: 20px;
}`
```

## Installation

### Prerequisites

- Visual Studio Code Version 1.108.0 or higher
- Node.js and npm for development

### From Sourcecode

1. Clone or download the repository
2. Install dependencies

```bash
   npm install
   npm run compile
```

3.In VS Code: Press ```F5``` to start a new Extension Development Host instance

### Usage

#### Commands

Hello World: Sample command (Ctrl+Shift+P → "Hello World")
Development
Project Structure

### Development

```Text
├── src/
│   ├── [extension.ts](http://_vscodecontentref_/0)             #Main entry point of the extension 
│   ├── internalPrinter.ts        # Logging utilities
│   ├── document/
│   │   ├── html-document/        # HTML parsing logic
│   │   ├── css-document/         # CSS parsing logic
│   │   ├── syntaxes/             # Syntax grammar definitions
│   │   └── experiments/          # AST analysis and tests
│   ├── utils/
│   │   └── allowed-tags.ts       # Allowed HTML tags
│   └── test/
│       └── extension.test.ts     # Unit tests
```

### Dependencies

Important Dependencies

```Text
parse5: HTML5-compliant parser
node-html-parser: Fast HTML parser
lit-analyzer: Analysis tools for lit-html
vscode-html-languageservice: HTML language services
vscode-css-languageservice: CSS language services
```

### Technical Details

#### The Extension Uses

```Text
Grammar Injection: Injects HTML/CSS syntax into JavaScript/TypeScript
Embedded Languages: Supports nested languages (HTML, CSS, SVG in JS/TS)
Diagnostic Collection: Collects and displays errors in templates
AST-Parsing: Analyzes template strings using Abstract Syntax Trees
```

Known Limitations
The extension is under active development
Some experimental features are still in the experiments/ folder

##### Autor

Developed by Emmanuel Youssef as part of a practical project in Semester 5 at Kardex Holding AG.
