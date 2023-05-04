"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberParser = void 0;
const index_js_1 = require("./index.js");
class NumberParser {
    constructor(description = {
        name: "Number",
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
        if ((0, index_js_1.isNumber)(a))
            return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
exports.NumberParser = NumberParser;
