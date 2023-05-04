"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectParser = void 0;
const utils_js_1 = require("./utils.js");
class ObjectParser {
    constructor(description = {
        name: "Object",
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
        if ((0, utils_js_1.isObject)(a))
            return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
exports.ObjectParser = ObjectParser;
