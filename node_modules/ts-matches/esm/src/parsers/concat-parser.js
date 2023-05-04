export class ConcatParsers {
    constructor(parent, otherParser, description = {
        name: "Concat",
        children: [parent, otherParser],
        extras: [],
    }) {
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parent
        });
        Object.defineProperty(this, "otherParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: otherParser
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    static of(parent, otherParser) {
        if (parent.unwrappedParser().description.name === "Any") {
            return otherParser;
        }
        if (otherParser.unwrappedParser().description.name === "Any") {
            return parent;
        }
        return new ConcatParsers(parent, otherParser);
    }
    parse(a, onParse) {
        const parent = this.parent.enumParsed(a);
        if ("error" in parent) {
            return onParse.invalid(parent.error);
        }
        const other = this.otherParser.enumParsed(parent.value);
        if ("error" in other) {
            return onParse.invalid(other.error);
        }
        return onParse.parsed(other.value);
    }
}
