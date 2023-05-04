"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.every = void 0;
// deno-lint-ignore-file no-explicit-any
const index_js_1 = require("./index.js");
/**
 * Intersection is a good tool to make sure that the validated value
 * is in the intersection of all the validators passed in. Basically an `and`
 * operator for validators
 */
function every(...parsers) {
    const filteredParsers = parsers.filter((x) => x !== index_js_1.any);
    if (filteredParsers.length <= 0) {
        return index_js_1.any;
    }
    const first = filteredParsers.splice(0, 1)[0];
    return filteredParsers.reduce((left, right) => {
        return left.concat(right);
    }, first);
}
exports.every = every;
