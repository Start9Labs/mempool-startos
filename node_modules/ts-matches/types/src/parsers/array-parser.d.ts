import { IParser, OnParse } from "./interfaces.js";
export declare class ArrayParser implements IParser<unknown, Array<unknown>> {
    readonly description: {
        readonly name: "Array";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "Array";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, Array<unknown>, C, D>): C | D;
}
