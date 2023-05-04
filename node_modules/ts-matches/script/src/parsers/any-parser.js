"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyParser = void 0;
class AnyParser {
    constructor(description = {
        name: "Any",
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
        return onParse.parsed(a);
    }
}
exports.AnyParser = AnyParser;
