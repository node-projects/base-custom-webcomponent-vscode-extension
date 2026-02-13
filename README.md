# Lit-HTML & Styled Components Extension

Eine VS Code Extension, die Syntax-Highlighting und Diagnose-Funktionen für lit-html Templates und styled-components in JavaScript/TypeScript-Projekten bereitstellt.

## Features

### Syntax Highlighting

Die Extension bietet umfassendes Syntax-Highlighting für:

- **lit-html Templates**: HTML-Syntax innerhalb von Template-Strings
- **CSS in lit-html**: CSS-Blöcke in `<style>`-Tags innerhalb von lit-html Templates
- **SVG-Support**: Vollständige Unterstützung für SVG-Elemente in lit-html
- **Styled Components**: CSS-Syntax in styled-components für JavaScript/TypeScript

### Unterstützte Dateitypen

Die Syntax-Hervorhebung wird in folgenden Dateitypen aktiviert:
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- HTML (`.html`)

### Template-Extraktion

Die Extension analysiert automatisch:
- HTML-Template-Literale in JavaScript/TypeScript
- CSS-Template-Literale in styled-components
- Verschachtelte CSS- und SVG-Blöcke

## Installation

### Voraussetzungen

- Visual Studio Code Version 1.108.0 oder höher
- Node.js und npm für Entwicklung

### Aus dem Quellcode

1. Repository klonen oder herunterladen
2. Dependencies installieren:
   ```bash
   npm install
   npm run compile
   ```
3. In VS Code: ```F5``` drücken, um eine neue Extension Development Host-Instanz zu starten

### Verwendung

##### Befehle
Hello World: Beispielbefehl (Ctrl+Shift+P → "Hello World")
Entwicklung
Projekt-Struktur

### Entwicklung
```
├── src/
│   ├── [extension.ts](http://_vscodecontentref_/0)             #Haupteinstiegspunkt der Extension
│   ├── internalPrinter.ts        # Logging-Utilities
│   ├── document/
│   │   ├── html-document/        # HTML-Parsing-Logik
│   │   ├── css-document/         # CSS-Parsing-Logik
│   │   ├── syntaxes/             # Syntax-Grammar-Definitionen
│   │   └── experiments/          # AST-Analysen und Tests
│   ├── utils/
│   │   └── allowed-tags.ts       # Erlaubte HTML-Tags
│   └── test/
│       └── extension.test.ts     # Unit-Tests
```

### Dependencies
Wichtige Abhängigkeiten
```
parse5: HTML5-konformer Parser
node-html-parser: Schneller HTML-Parser
lit-analyzer: Analyse-Tools für lit-html
vscode-html-languageservice: HTML-Sprachdienste
vscode-css-languageservice: CSS-Sprachdienste
```

### Technische Details

#### Die Extension nutzt:
```
Grammar Injection: Injiziert HTML/CSS-Syntax in JavaScript/TypeScript
Embedded Languages: Unterstützt verschachtelte Sprachen (HTML, CSS, SVG in JS/TS)
Diagnostic Collection: Sammelt und zeigt Fehler in Templates an
AST-Parsing: Analysiert Template-Strings mittels Abstract Syntax Trees
```

Bekannte Einschränkungen
Die Extension befindet sich in aktiver Entwicklung
Einige experimentelle Features sind noch in der experiments/-Ordner

#### Autor
Entwickelt von Emmanuel Youssef im Rahmen eines Praxisprojekts im Semester 5 bei Kardex Holding AG.