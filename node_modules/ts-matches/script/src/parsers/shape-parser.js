"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shape = exports.isShape = exports.partial = exports.isPartial = exports.ShapeParser = void 0;
// deno-lint-ignore-file no-explicit-any ban-types
const index_js_1 = require("./index.js");
const utils_js_1 = require("../utils.js");
/**
 * Given an object, we want to make sure the key exists and that the value on
 * the key matches the parser
 */
class ShapeParser {
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
        if (!index_js_1.object.test(a)) {
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
                    error.keys.push((0, utils_js_1.saferStringify)(key));
                    return onParse.invalid(error);
                }
                const smallValue = state.value;
                value[key] = smallValue;
            }
            else if (!isPartial) {
                return onParse.invalid({
                    value: "missingProperty",
                    parser,
                    keys: [(0, utils_js_1.saferStringify)(key)],
                });
            }
        }
        return onParse.parsed(value);
    }
}
exports.ShapeParser = ShapeParser;
const isPartial = (testShape) => {
    return new index_js_1.Parser(new ShapeParser(testShape, true));
};
exports.isPartial = isPartial;
/**
 * Good for duck typing an object, with optional values
 * @param testShape Shape of validators, to ensure we match the shape
 */
exports.partial = exports.isPartial;
/**
 * Good for duck typing an object
 * @param testShape Shape of validators, to ensure we match the shape
 */
const isShape = (testShape) => {
    return new index_js_1.Parser(new ShapeParser(testShape, false));
};
exports.isShape = isShape;
function shape(testShape, optionals, optionalAndDefaults) {
    if (optionals) {
        const defaults = optionalAndDefaults || {};
        const entries = Object.entries(testShape);
        const optionalSet = new Set(Array.from(optionals));
        return (0, index_js_1.every)((0, exports.partial)(Object.fromEntries(entries
            .filter(([key, _]) => optionalSet.has(key))
            .map(([key, parser]) => [key, parser.optional()]))), (0, exports.isShape)(Object.fromEntries(entries.filter(([key, _]) => !optionalSet.has(key))))).map((ret) => {
            for (const key of optionalSet) {
                const keyAny = key;
                if (!(keyAny in ret) && keyAny in defaults) {
                    ret[keyAny] = defaults[keyAny];
                }
            }
            return ret;
        });
    }
    return (0, exports.isShape)(testShape);
}
exports.shape = shape;
