import { IParser, OnParse } from "./interfaces.js";
export declare class GuardParser<A, B> implements IParser<A, B> {
    readonly checkIsA: (value: A) => value is A & B;
    readonly typeName: string;
    readonly description: {
        readonly name: "Guard";
        readonly children: readonly [];
        readonly extras: readonly [string];
    };
    constructor(checkIsA: (value: A) => value is A & B, typeName: string, description?: {
        readonly name: "Guard";
        readonly children: readonly [];
        readonly extras: readonly [string];
    });
    parse<C, D>(a: A, onParse: OnParse<A, B, C, D>): C | D;
}
