export const isObject = (x) => typeof x === "object" && x != null;
export const isFunctionTest = (x) => typeof x === "function";
export const isNumber = (x) => typeof x === "number";
export const isString = (x) => typeof x === "string";
export const empty = [];
export const booleanOnParse = {
    parsed(_) {
        return true;
    },
    invalid(_) {
        return false;
    },
};
