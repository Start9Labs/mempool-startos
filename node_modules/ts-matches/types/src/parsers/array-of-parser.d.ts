import { Parser } from "./index.js";
import { IParser, OnParse } from "./interfaces.js";
/**
 * Given an object, we want to make sure the key exists and that the value on
 * the key matches the parser
 * Note: This will mutate the value sent through
 */
export declare class ArrayOfParser<B> implements IParser<unknown, B[]> {
    readonly parser: Parser<unknown, B>;
    readonly description: {
        readonly name: "ArrayOf";
        readonly children: readonly [Parser<unknown, B>];
        readonly extras: readonly [];
    };
    constructor(parser: Parser<unknown, B>, description?: {
        readonly name: "ArrayOf";
        readonly children: readonly [Parser<unknown, B>];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, B[], C, D>): C | D;
}
/**
 * We would like to validate that all of the array is of the same type
 * @param validator What is the validator for the values in the array
 */
export declare function arrayOf<A>(validator: Parser<unknown, A>): Parser<unknown, A[]>;
