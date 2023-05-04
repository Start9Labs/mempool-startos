import { IParser, OnParse } from "./interfaces.js";
export declare class NumberParser implements IParser<unknown, number> {
    readonly description: {
        readonly name: "Number";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "Number";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, number, C, D>): C | D;
}
