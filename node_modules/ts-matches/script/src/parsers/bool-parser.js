"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoolParser = void 0;
class BoolParser {
    constructor(description = {
        name: "Boolean",
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
        if (a === true || a === false)
            return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
exports.BoolParser = BoolParser;
