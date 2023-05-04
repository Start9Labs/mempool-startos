"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardParser = void 0;
class GuardParser {
    constructor(checkIsA, typeName, description = {
        name: "Guard",
        children: [],
        extras: [typeName],
    }) {
        Object.defineProperty(this, "checkIsA", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: checkIsA
        });
        Object.defineProperty(this, "typeName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: typeName
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        if (this.checkIsA(a)) {
            return onParse.parsed(a);
        }
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this,
        });
    }
}
exports.GuardParser = GuardParser;
