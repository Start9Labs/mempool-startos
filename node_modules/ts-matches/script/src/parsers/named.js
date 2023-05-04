"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserName = exports.NamedParser = void 0;
const index_js_1 = require("./index.js");
class NamedParser {
    constructor(parent, name, description = {
        name: "Named",
        children: [parent],
        extras: [name],
    }) {
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parent
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        // deno-lint-ignore no-this-alias
        const parser = this;
        const parent = this.parent.enumParsed(a);
        if ("error" in parent) {
            const { error } = parent;
            error.parser = parser;
            return onParse.invalid(error);
        }
        return onParse.parsed(parent.value);
    }
}
exports.NamedParser = NamedParser;
function parserName(name, parent) {
    return new index_js_1.Parser(new NamedParser(parent, name));
}
exports.parserName = parserName;
