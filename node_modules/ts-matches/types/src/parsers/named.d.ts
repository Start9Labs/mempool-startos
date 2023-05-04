import { Parser } from "./index.js";
import { IParser, OnParse } from "./interfaces.js";
export declare class NamedParser<A, B> implements IParser<A, B> {
    readonly parent: Parser<A, B>;
    readonly name: string;
    readonly description: {
        readonly name: "Named";
        readonly children: readonly [Parser<A, B>];
        readonly extras: readonly [string];
    };
    constructor(parent: Parser<A, B>, name: string, description?: {
        readonly name: "Named";
        readonly children: readonly [Parser<A, B>];
        readonly extras: readonly [string];
    });
    parse<C, D>(a: A, onParse: OnParse<A, B, C, D>): C | D;
}
export declare function parserName<A, B>(name: string, parent: Parser<A, B>): Parser<A, B>;
