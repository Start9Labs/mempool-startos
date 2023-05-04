// deno-lint-ignore-file no-explicit-any ban-types
import { object } from "./index.js";
export class DictionaryParser {
    constructor(parsers, description = {
        name: "Dictionary",
        children: parsers.reduce((acc, [k, v]) => {
            acc.push(k, v);
            return acc;
        }, []),
        extras: [],
    }) {
        Object.defineProperty(this, "parsers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parsers
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        const { parsers } = this;
        // deno-lint-ignore no-this-alias
        const parser = this;
        const entries = Object.entries(a);
        for (const entry of entries) {
            const [key, value] = entry;
            const found = findOrError(parsers, key, value, parser);
            if (found == undefined)
                return onParse.parsed(a);
            if ("error" in found)
                return onParse.invalid(found.error);
            entry[0] = found[0].value;
            entry[1] = found[1].value;
        }
        const answer = Object.fromEntries(entries);
        return onParse.parsed(answer);
    }
}
export const dictionary = (...parsers) => {
    return object.concat(new DictionaryParser([...parsers]));
};
function findOrError(parsers, key, value, parser) {
    let foundError;
    for (const [keyParser, valueParser] of parsers) {
        const enumState = keyParser.enumParsed(key);
        const valueState = valueParser.enumParsed(value);
        if ("error" in enumState) {
            if (!foundError) {
                const { error } = enumState;
                error.parser = parser;
                error.keys.push("" + key);
                foundError = { error };
            }
            continue;
        }
        const newKey = enumState.value;
        if ("error" in valueState) {
            if (!foundError) {
                const { error } = valueState;
                error.keys.push("" + newKey);
                foundError = { error };
            }
            continue;
        }
        return [enumState, valueState];
    }
    return foundError;
}
