import { IParser, OnParse } from "./interfaces.js";
import { Parser } from "./parser.js";
export declare class OrParsers<A, A2, B, B2> implements IParser<A | A2, B | B2> {
    readonly parent: Parser<A, B>;
    readonly otherParser: Parser<A2, B2>;
    readonly description: {
        readonly name: "Or";
        readonly children: readonly [Parser<A, B>, Parser<A2, B2>];
        readonly extras: readonly [];
    };
    constructor(parent: Parser<A, B>, otherParser: Parser<A2, B2>, description?: {
        readonly name: "Or";
        readonly children: readonly [Parser<A, B>, Parser<A2, B2>];
        readonly extras: readonly [];
    });
    parse<C, D>(a: A & A2, onParse: OnParse<A | A2, B | B2, C, D>): C | D;
}
