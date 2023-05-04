"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.literals = exports.literal = exports.LiteralsParser = void 0;
const parser_js_1 = require("./parser.js");
class LiteralsParser {
    constructor(values, description = {
        name: "Literal",
        children: [],
        extras: values,
    }) {
        Object.defineProperty(this, "values", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: values
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        if (this.values.indexOf(a) >= 0) {
            return onParse.parsed(a);
        }
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
exports.LiteralsParser = LiteralsParser;
function literal(isEqualToValue) {
    return new parser_js_1.Parser(new LiteralsParser([isEqualToValue]));
}
exports.literal = literal;
function literals(firstValue, ...restValues) {
    return new parser_js_1.Parser(new LiteralsParser([firstValue, ...restValues]));
}
exports.literals = literals;
