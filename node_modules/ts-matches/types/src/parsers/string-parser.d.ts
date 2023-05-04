import { IParser, OnParse } from "./interfaces.js";
export declare class StringParser implements IParser<unknown, string> {
    readonly description: {
        readonly name: "String";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "String";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, string, C, D>): C | D;
}
