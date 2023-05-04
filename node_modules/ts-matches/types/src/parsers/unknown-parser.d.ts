import { IParser, OnParse } from "./interfaces.js";
export declare class UnknownParser implements IParser<unknown, unknown> {
    readonly description: {
        readonly name: "Unknown";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "Unknown";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, unknown, C, D>): C | D;
}
