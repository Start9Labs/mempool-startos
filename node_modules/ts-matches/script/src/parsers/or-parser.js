"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrParsers = void 0;
class OrParsers {
    constructor(parent, otherParser, description = {
        name: "Or",
        children: [parent, otherParser],
        extras: [],
    }) {
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parent
        });
        Object.defineProperty(this, "otherParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: otherParser
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
        if ("value" in parent) {
            return onParse.parsed(parent.value);
        }
        const other = this.otherParser.enumParsed(a);
        if ("error" in other) {
            const { error } = other;
            error.parser = parser;
            return onParse.invalid(error);
        }
        return onParse.parsed(other.value);
    }
}
exports.OrParsers = OrParsers;
