import { IParser, OnParse } from "./interfaces.js";
export declare class BoolParser implements IParser<unknown, boolean> {
    readonly description: {
        readonly name: "Boolean";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "Boolean";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, boolean, C, D>): C | D;
}
