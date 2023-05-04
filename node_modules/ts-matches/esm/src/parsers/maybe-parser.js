export class MaybeParser {
    constructor(parent, description = {
        name: "Maybe",
        children: [parent],
        extras: [],
    }) {
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parent
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
    parse(a, onParse) {
        if (a == null) {
            return onParse.parsed(null);
        }
        // deno-lint-ignore no-this-alias
        const parser = this;
        const parentState = this.parent.enumParsed(a);
        if ("error" in parentState) {
            const { error } = parentState;
            error.parser = parser;
            return onParse.invalid(error);
        }
        return onParse.parsed(parentState.value);
    }
}
