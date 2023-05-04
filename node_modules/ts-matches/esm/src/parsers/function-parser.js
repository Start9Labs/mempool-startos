import { isFunctionTest } from "./utils.js";
export class FunctionParser {
    constructor(description = {
        name: "Function",
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
        if (isFunctionTest(a))
            return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
