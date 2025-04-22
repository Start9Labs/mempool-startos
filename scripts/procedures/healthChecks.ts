import { types as T, checkWebUrl, catchError } from "../deps.ts";

export const health: T.ExpectedExports.health = {
  // deno-lint-ignore require-await
  async "web-ui"(effects, _duration) {
    return checkWebUrl("http://mempool.embassy:8080")(effects, 30000).catch(
      catchError(effects)
    );
  },
};
