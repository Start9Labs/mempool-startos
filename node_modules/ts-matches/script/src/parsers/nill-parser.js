"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NilParser = void 0;
class NilParser {
    constructor(description = {
        name: "Null",
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
        if (a === null || a === undefined)
            return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
exports.NilParser = NilParser;
