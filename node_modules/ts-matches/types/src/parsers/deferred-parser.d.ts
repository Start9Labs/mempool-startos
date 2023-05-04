import { IParser, OnParse } from "./interfaces.js";
import { Parser } from "./parser.js";
/**
 * This is needed when the typescript has a recursive, mutual types
 * type Things = string | [OtherThings]
 * type OtherThings = {type: 'other', value:Things }
 */
export declare class DeferredParser<B> implements IParser<unknown, B> {
    readonly description: {
        readonly name: "Deferred";
        readonly children: readonly [];
        readonly extras: readonly [];
    };
    private parser?;
    static create<B>(): DeferredParser<B>;
    private constructor();
    setParser(parser: IParser<unknown, B>): this;
    parse<C, D>(a: unknown, onParse: OnParse<unknown, B, C, D>): C | D;
}
/**
 * Must pass the shape that we expect since typescript as of this point
 * can't infer with recursive like structures like this.
 * @returns [Parser, setParser] Use the setParser to set the parser later
 */
export declare function deferred<B = never>(): readonly [Parser<unknown, B>, (parser: IParser<unknown, B>) => void];
