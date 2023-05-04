"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.some = void 0;
const simple_parsers_js_1 = require("./simple-parsers.js");
/**
 * Union is a good tool to make sure that the validated value
 * is in the union of all the validators passed in. Basically an `or`
 * operator for validators.
 */
function some(...parsers) {
    if (parsers.length <= 0) {
        return simple_parsers_js_1.any;
    }
    const first = parsers.splice(0, 1)[0];
    return parsers.reduce((left, right) => left.orParser(right), first);
}
exports.some = some;
