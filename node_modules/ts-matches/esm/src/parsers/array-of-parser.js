// deno-lint-ignore-file no-explicit-any
import { Parser } from "./index.js";
/**
 * Given an object, we want to make sure the key exists and that the value on
 * the key matches the parser
 * Note: This will mutate the value sent through
 */
export class ArrayOfParser {
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
/**
 * We would like to validate that all of the array is of the same type
 * @param validator What is the validator for the values in the array
 */
export function arrayOf(validator) {
    return new Parser(new ArrayOfParser(validator));
}
