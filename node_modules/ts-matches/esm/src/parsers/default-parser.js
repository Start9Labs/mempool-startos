export class DefaultParser {
    constructor(parent, defaultValue, description = {
        name: "Default",
        children: [parent],
        extras: [defaultValue],
    }) {
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parent
        });
        Object.defineProperty(this, "defaultValue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: defaultValue
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
        const defaultValue = this.defaultValue;
        if (a == null) {
            return onParse.parsed(defaultValue);
        }
        const parentCheck = this.parent.enumParsed(a);
        if ("error" in parentCheck) {
            parentCheck.error.parser = parser;
            return onParse.invalid(parentCheck.error);
        }
        return onParse.parsed(parentCheck.value);
    }
}
