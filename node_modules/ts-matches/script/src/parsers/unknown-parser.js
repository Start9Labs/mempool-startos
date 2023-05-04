"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownParser = void 0;
class UnknownParser {
    constructor(description = {
        name: "Unknown",
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
exports.UnknownParser = UnknownParser;
