"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanOnParse = exports.empty = exports.isString = exports.isNumber = exports.isFunctionTest = exports.isObject = void 0;
const isObject = (x) => typeof x === "object" && x != null;
exports.isObject = isObject;
const isFunctionTest = (x) => typeof x === "function";
exports.isFunctionTest = isFunctionTest;
const isNumber = (x) => typeof x === "number";
exports.isNumber = isNumber;
const isString = (x) => typeof x === "string";
exports.isString = isString;
exports.empty = [];
exports.booleanOnParse = {
    parsed(_) {
        return true;
    },
    invalid(_) {
        return false;
    },
};
