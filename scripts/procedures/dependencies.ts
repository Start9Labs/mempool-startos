import { matches, types as T } from "../deps.ts";

const { shape, string, boolean } = matches;

const matchBitcoindConfig = shape({
  advanced: shape({
    pruning: shape({
      mode: string,
    }),
  }),
  rpc: shape({
    enable: boolean,
  }),
  txindex: boolean,
});

export const dependencies: T.ExpectedExports.dependencies = {
  bitcoind: {
    // deno-lint-ignore require-await
    async check(effects, configInput) {
      effects.info("check bitcoind");
      const config = matchBitcoindConfig.unsafeCast(configInput);
      if (!config.rpc.enable) {
        return { error: "Must have RPC enabled" };
      }
      if (!config.txindex) {
        return { error: "Must have transaction indexing enabled" };
      }
      if (config.advanced.pruning.mode == "enabled") {
        return {
          error:
            "Pruning must be disabled to use Bitcoin Core.",
        };
      }
      return { result: null };
    },
    // deno-lint-ignore require-await
    async autoConfigure(effects, configInput) {
      effects.info("autoconfigure bitcoind");
      const config = matchBitcoindConfig.unsafeCast(configInput);
      config.rpc.enable = true;
      config.txindex = true;
      config.advanced.pruning.mode = "disabled";
      return { result: config };
    },
  }
};
