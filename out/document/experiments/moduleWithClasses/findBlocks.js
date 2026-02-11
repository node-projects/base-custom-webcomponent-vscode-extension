"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindBlocks = void 0;
const mapCreater_1 = require("./mapCreater");
const checkBrackets_1 = require("./checkBrackets");
const mapCreater_2 = require("./mapCreater");
class FindBlocks {
    document;
    diagnosticCollectionLocal = [];
    constructor(documentLocal) {
        this.document = documentLocal;
        this.diagnosticCollectionLocal = [];
    }
    findHtmlBlocks() {
        const htmlTagRegex = new RegExp(String.raw `\bhtml\s*\`([\s\S]*?)\``, "g");
        const htmlTagsPositionResults = []; // includes start and end offset of first letter of the html block(excluding html` and )
        let match;
        while ((match = htmlTagRegex.exec(this.document.getText())) !== null) {
            htmlTagsPositionResults.push(match.index + 5);
            htmlTagsPositionResults.push(match[0].length + match.index - 1);
            const offsetsOfBracketsMap = (0, mapCreater_1.createOffsetmapOfBrackets)(htmlTagsPositionResults, this.document);
            //console.log(match);
            (0, checkBrackets_1.checkBracketMatching)(offsetsOfBracketsMap, this.diagnosticCollectionLocal, this.document);
            htmlTagsPositionResults.pop();
            htmlTagsPositionResults.pop();
        }
    }
    findProperties() {
        const propertyRegex = new RegExp(String.raw `@property\s*\([\s\S]*?\)\s*([A-Za-z_][A-Za-z0-9_]*)`, "g");
        const propertyPositionsResults = []; // includes start and end offset of first letter of the property declaration(excluding @property(...) and ; or { )
        let matchProp;
        console.log("i was here");
        while ((matchProp = propertyRegex.exec(this.document.getText())) !== null) {
            propertyPositionsResults.push(matchProp.index + matchProp[0].lastIndexOf(matchProp[1]));
            propertyPositionsResults.push(matchProp.index + matchProp[0].lastIndexOf(matchProp[1]) + matchProp[1].length);
            const propertieMap = (0, mapCreater_2.createPropertiesMap)(propertyPositionsResults, this.document);
            console.log(propertieMap.get(0)?.propertyName);
            //checkProperties(extraxtProperties(propertyPositionsResults));
            propertyPositionsResults.pop();
            propertyPositionsResults.pop();
        }
    }
}
exports.FindBlocks = FindBlocks;
//# sourceMappingURL=findBlocks.js.map