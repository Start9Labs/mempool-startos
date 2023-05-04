import { Parser } from "./parser.js";
export class LiteralsParser {
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
export function literal(isEqualToValue) {
    return new Parser(new LiteralsParser([isEqualToValue]));
}
export function literals(firstValue, ...restValues) {
    return new Parser(new LiteralsParser([firstValue, ...restValues]));
}
