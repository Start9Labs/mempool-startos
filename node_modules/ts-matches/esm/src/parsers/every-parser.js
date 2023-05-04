// deno-lint-ignore-file no-explicit-any
import { any } from "./index.js";
/**
 * Intersection is a good tool to make sure that the validated value
 * is in the intersection of all the validators passed in. Basically an `and`
 * operator for validators
 */
export function every(...parsers) {
    const filteredParsers = parsers.filter((x) => x !== any);
    if (filteredParsers.length <= 0) {
        return any;
    }
    const first = filteredParsers.splice(0, 1)[0];
    return filteredParsers.reduce((left, right) => {
        return left.concat(right);
    }, first);
}
