import { IParser, OnParse } from "./interfaces.js";
export declare class ObjectParser implements IParser<unknown, object> {
    readonly description: {
        readonly name: "Object";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    constructor(description?: {
        readonly name: "Object";
        readonly children: readonly [];
        readonly extras: readonly [];
    });
    parse<C, D>(a: unknown, onParse: OnParse<unknown, object, C, D>): C | D;
}
