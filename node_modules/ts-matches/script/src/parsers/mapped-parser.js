"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappedAParser = void 0;
class MappedAParser {
    constructor(parent, map, mappingName = map.name, description = {
        name: "Mapped",
        children: [parent],
        extras: [mappingName],
    }) {
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parent
        });
        Object.defineProperty(this, "map", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: map
        });
        Object.defineProperty(this, "mappingName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mappingName
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        const map = this.map;
        const result = this.parent.enumParsed(a);
        if ("error" in result) {
            return onParse.invalid(result.error);
        }
        return onParse.parsed(map(result.value));
    }
}
exports.MappedAParser = MappedAParser;
