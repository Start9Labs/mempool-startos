"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tuple = exports.TupleParser = void 0;
// deno-lint-ignore-file no-explicit-any
const index_js_1 = require("./index.js");
const utils_js_1 = require("../utils.js");
class TupleParser {
    constructor(parsers, lengthMatcher = (0, index_js_1.literal)(parsers.length), description = {
        name: "Tuple",
        children: parsers,
        extras: [],
    }) {
        Object.defineProperty(this, "parsers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parsers
        });
        Object.defineProperty(this, "lengthMatcher", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: lengthMatcher
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(input, onParse) {
        const tupleError = index_js_1.isArray.enumParsed(input);
        if ("error" in tupleError)
            return onParse.invalid(tupleError.error);
        const values = input;
        const stateCheck = this.lengthMatcher.enumParsed(values.length);
        if ("error" in stateCheck) {
            stateCheck.error.keys.push((0, utils_js_1.saferStringify)("length"));
            return onParse.invalid(stateCheck.error);
        }
        const answer = new Array(this.parsers.length);
        for (const key in this.parsers) {
            const parser = this.parsers[key];
            const value = values[key];
            const result = parser.enumParsed(value);
            if ("error" in result) {
                const { error } = result;
                error.keys.push((0, utils_js_1.saferStringify)(key));
                return onParse.invalid(error);
            }
            answer[key] = result.value;
        }
        return onParse.parsed(answer);
    }
}
exports.TupleParser = TupleParser;
function tuple(...parsers) {
    return new index_js_1.Parser(new TupleParser(parsers));
}
exports.tuple = tuple;
