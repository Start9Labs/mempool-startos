import * as m from "./mock.js";
export declare const mock: typeof m;
export * from "./expect.js";
export declare function it(name: string, fn: () => void | Promise<void>): void;
