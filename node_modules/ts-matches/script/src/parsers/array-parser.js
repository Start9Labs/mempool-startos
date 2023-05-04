"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayParser = void 0;
class ArrayParser {
    constructor(description = {
        name: "Array",
        children: [],
        extras: [],
    }) {
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        if (Array.isArray(a))
            return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
exports.ArrayParser = ArrayParser;
