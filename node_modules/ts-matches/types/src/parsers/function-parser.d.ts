import { IParser, OnParse } from "./interfaces.js";
export declare class FunctionParser implements IParser<unknown, Function> {
    readonly description: {
        readonly name: "Function";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "Function";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, Function, C, D>): C | D;
}
