import { Parser } from "./index.js";
import { IParser, NonNull, OnParse, Optional } from "./interfaces.js";
export declare class DefaultParser<A, B, B2> implements IParser<Optional<A>, NonNull<B, B2>> {
    readonly parent: Parser<A, B>;
    readonly defaultValue: B2;
    readonly description: {
        readonly name: "Default";
        readonly children: readonly [Parser<A, B>];
        readonly extras: readonly [B2];
    };
    constructor(parent: Parser<A, B>, defaultValue: B2, description?: {
        readonly name: "Default";
        readonly children: readonly [Parser<A, B>];
        readonly extras: readonly [B2];
    });
    parse<C, D>(a: A, onParse: OnParse<Optional<A>, NonNull<B, B2>, C, D>): C | D;
}
