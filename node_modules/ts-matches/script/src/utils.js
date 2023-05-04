"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saferStringify = void 0;
/**
 * Tries and run the stringify, if that fails just return the toString
 * @param x Could be anything, including a recursive object
 */
function saferStringify(x) {
    try {
        return JSON.stringify(x);
    }
    catch (e) {
        return "" + x;
    }
}
exports.saferStringify = saferStringify;
