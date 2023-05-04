// deno-lint-ignore-file no-explicit-any ban-types
import { every, object, Parser } from "./index.js";
import { saferStringify } from "../utils.js";
/**
 * Given an object, we want to make sure the key exists and that the value on
 * the key matches the parser
 */
export class ShapeParser {
    constructor(parserMap, isPartial, parserKeys = Object.keys(parserMap), description = {
        name: isPartial ? "Partial" : "Shape",
        children: parserKeys.map((key) => parserMap[key]),
        extras: parserKeys,
    }) {
        Object.defineProperty(this, "parserMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parserMap
        });
        Object.defineProperty(this, "isPartial", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: isPartial
        });
        Object.defineProperty(this, "parserKeys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parserKeys
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        // deno-lint-ignore no-this-alias
        const parser = this;
        if (!object.test(a)) {
            return onParse.invalid({
                value: a,
                keys: [],
                parser,
            });
        }
        const { parserMap, isPartial } = this;
        const value = { ...a };
        if (Array.isArray(a)) {
            value.length = a.length;
        }
        for (const key in parserMap) {
            if (key in value) {
                const parser = parserMap[key];
                const state = parser.enumParsed(a[key]);
                if ("error" in state) {
                    const { error } = state;
                    error.keys.push(saferStringify(key));
                    return onParse.invalid(error);
                }
                const smallValue = state.value;
                value[key] = smallValue;
            }
            else if (!isPartial) {
                return onParse.invalid({
                    value: "missingProperty",
                    parser,
                    keys: [saferStringify(key)],
                });
            }
        }
        return onParse.parsed(value);
    }
}
export const isPartial = (testShape) => {
    return new Parser(new ShapeParser(testShape, true));
};
/**
 * Good for duck typing an object, with optional values
 * @param testShape Shape of validators, to ensure we match the shape
 */
export const partial = isPartial;
/**
 * Good for duck typing an object
 * @param testShape Shape of validators, to ensure we match the shape
 */
export const isShape = (testShape) => {
    return new Parser(new ShapeParser(testShape, false));
};
export function shape(testShape, optionals, optionalAndDefaults) {
    if (optionals) {
        const defaults = optionalAndDefaults || {};
        const entries = Object.entries(testShape);
        const optionalSet = new Set(Array.from(optionals));
        return every(partial(Object.fromEntries(entries
            .filter(([key, _]) => optionalSet.has(key))
            .map(([key, parser]) => [key, parser.optional()]))), isShape(Object.fromEntries(entries.filter(([key, _]) => !optionalSet.has(key))))).map((ret) => {
            for (const key of optionalSet) {
                const keyAny = key;
                if (!(keyAny in ret) && keyAny in defaults) {
                    ret[keyAny] = defaults[keyAny];
                }
            }
            return ret;
        });
    }
    return isShape(testShape);
}
