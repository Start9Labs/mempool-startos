import { IParser, OnParse } from "./interfaces.js";
export declare class NilParser implements IParser<unknown, null | undefined> {
    readonly description: {
        readonly name: "Null";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "Null";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, null | undefined, C, D>): C | D;
}
