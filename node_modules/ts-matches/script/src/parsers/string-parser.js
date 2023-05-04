"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringParser = void 0;
const utils_js_1 = require("./utils.js");
class StringParser {
    constructor(description = {
        name: "String",
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
        if ((0, utils_js_1.isString)(a))
            return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
exports.StringParser = StringParser;
