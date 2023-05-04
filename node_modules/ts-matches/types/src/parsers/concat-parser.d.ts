import { Parser } from "./index.js";
import { IParser, OnParse } from "./interfaces.js";
export declare class ConcatParsers<A, B, B2> implements IParser<A, B2> {
    readonly parent: Parser<A, B>;
    readonly otherParser: Parser<B, B2>;
    readonly description: {
        readonly name: "Concat";
        readonly children: readonly [Parser<A, B>, Parser<B, B2>];
        readonly extras: readonly [];
    };
    private constructor();
    static of<A, B, B2>(parent: Parser<A, B>, otherParser: Parser<B, B2>): Parser<A, B> | Parser<B, B2> | ConcatParsers<A, B, B2>;
    parse<C, D>(a: A, onParse: OnParse<A, B2, C, D>): C | D;
}
