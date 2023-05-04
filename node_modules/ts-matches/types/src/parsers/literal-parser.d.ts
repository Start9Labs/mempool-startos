import { IParser, OnParse } from "./interfaces.js";
import { Parser } from "./parser.js";
import { OneOf } from "./utils.js";
export declare class LiteralsParser<B extends unknown[]> implements IParser<unknown, OneOf<B>> {
    readonly values: B;
    readonly description: {
        readonly name: "Literal";
        readonly children: readonly [];
        readonly extras: B;
    };
    constructor(values: B, description?: {
        readonly name: "Literal";
        readonly children: readonly [];
        readonly extras: B;
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, OneOf<B>, C, D>): C | D;
}
export declare function literal<A extends string | number | boolean | null | undefined>(isEqualToValue: A): Parser<unknown, A>;
export declare function literals<A extends string | number | boolean | null | undefined, Rest extends Array<string | number | boolean | null | undefined>>(firstValue: A, ...restValues: Rest): Parser<unknown, A | OneOf<Rest>>;
