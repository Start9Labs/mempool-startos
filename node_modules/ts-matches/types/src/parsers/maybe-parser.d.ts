import { Parser } from "./index.js";
import { IParser, OnParse, Optional } from "./interfaces.js";
export declare class MaybeParser<A, B> implements IParser<Optional<A>, Optional<B>> {
    readonly parent: Parser<A, B>;
    readonly description: {
        readonly name: "Maybe";
        readonly children: readonly [Parser<A, B>];
        readonly extras: readonly [];
    };
    constructor(parent: Parser<A, B>, description?: {
        readonly name: "Maybe";
        readonly children: readonly [Parser<A, B>];
        readonly extras: readonly [];
    });
    parse<C, D>(a: A, onParse: OnParse<Optional<A>, Optional<B>, C, D>): C | D;
}
