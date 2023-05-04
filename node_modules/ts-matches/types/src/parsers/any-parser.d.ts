import { IParser, OnParse } from "./interfaces.js";
export declare class AnyParser implements IParser<unknown, any> {
    readonly description: {
        readonly name: "Any";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "Any";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, any, C, D>): C | D;
}
