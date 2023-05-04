// deno-lint-ignore-file no-explicit-any
import { isArray, literal, Parser } from "./index.js";
import { saferStringify } from "../utils.js";
export class TupleParser {
    constructor(parsers, lengthMatcher = literal(parsers.length), description = {
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
        const tupleError = isArray.enumParsed(input);
        if ("error" in tupleError)
            return onParse.invalid(tupleError.error);
        const values = input;
        const stateCheck = this.lengthMatcher.enumParsed(values.length);
        if ("error" in stateCheck) {
            stateCheck.error.keys.push(saferStringify("length"));
            return onParse.invalid(stateCheck.error);
        }
        const answer = new Array(this.parsers.length);
        for (const key in this.parsers) {
            const parser = this.parsers[key];
            const value = values[key];
            const result = parser.enumParsed(value);
            if ("error" in result) {
                const { error } = result;
                error.keys.push(saferStringify(key));
                return onParse.invalid(error);
            }
            answer[key] = result.value;
        }
        return onParse.parsed(answer);
    }
}
export function tuple(...parsers) {
    return new Parser(new TupleParser(parsers));
}
