"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayOf = exports.ArrayOfParser = void 0;
// deno-lint-ignore-file no-explicit-any
const index_js_1 = require("./index.js");
/**
 * Given an object, we want to make sure the key exists and that the value on
 * the key matches the parser
 * Note: This will mutate the value sent through
 */
class ArrayOfParser {
    constructor(parser, description = {
        name: "ArrayOf",
        children: [parser],
        extras: [],
    }) {
        Object.defineProperty(this, "parser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parser
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        if (!Array.isArray(a)) {
            return onParse.invalid({
                value: a,
                keys: [],
                parser: this,
            });
        }
        const values = [...a];
        for (let index = 0; index < values.length; index++) {
            const result = this.parser.enumParsed(values[index]);
            if ("error" in result) {
                result.error.keys.push("" + index);
                return onParse.invalid(result.error);
            }
            else {
                values[index] = result.value;
            }
        }
        return onParse.parsed(values);
    }
}
exports.ArrayOfParser = ArrayOfParser;
/**
 * We would like to validate that all of the array is of the same type
 * @param validator What is the validator for the values in the array
 */
function arrayOf(validator) {
    return new index_js_1.Parser(new ArrayOfParser(validator));
}
exports.arrayOf = arrayOf;
