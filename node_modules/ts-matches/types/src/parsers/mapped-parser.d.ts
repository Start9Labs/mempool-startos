import { Parser } from "./index.js";
import { IParser, OnParse } from "./interfaces.js";
export declare class MappedAParser<A, B, B2> implements IParser<A, B2> {
    readonly parent: Parser<A, B>;
    readonly map: (value: B) => B2;
    readonly mappingName: string;
    readonly description: {
        readonly name: "Mapped";
        readonly children: readonly [Parser<A, B>];
        readonly extras: readonly [string];
    };
    constructor(parent: Parser<A, B>, map: (value: B) => B2, mappingName?: string, description?: {
        readonly name: "Mapped";
        readonly children: readonly [Parser<A, B>];
        readonly extras: readonly [string];
    });
    parse<C, D>(a: A, onParse: OnParse<A, B2, C, D>): C | D;
}
