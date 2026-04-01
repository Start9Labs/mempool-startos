import { matches, types as T } from "../deps.ts";

const { shape, string, boolean, number } = matches;

const matchBitcoindConfig = shape({
  advanced: shape({
    pruning: shape({
      mode: string,
    }),
    mempool: shape({
      maxmempool: number
    })
  }),
  rpc: shape({
    enable: boolean,
  }),
  txindex: boolean,
});

async function getSystemMemoryLimit(effects: T.Effects) {
  try {
    const memdata = await effects.readFile({ volumeId: 'main', path: 'start9/system_mem_info'})
    // convert kb to mb
    const memMB = parseInt(memdata) / 1000
    return Math.round(memMB / 6)
  } catch (_e) {
    // recommended default is 300MB
    return 300
  }
}

export const dependencies: T.ExpectedExports.dependencies = {
  bitcoind: {
    async check(effects, configInput) {
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
      const limit = await getSystemMemoryLimit(effects);
      if (limit > 300 && config.advanced.mempool.maxmempool > limit) {
        return {
          error: "In order to safely run Mempool, Bitcoin Core's \"maxmempool\" size cannot exceed 1/6 of the system RAM"
        }
      }
      return { result: null };
    },
    async autoConfigure(effects, configInput) {
      const config = matchBitcoindConfig.unsafeCast(configInput);
      config.rpc.enable = true;
      config.txindex = true;
      config.advanced.pruning.mode = "disabled";
      const limit = await getSystemMemoryLimit(effects);
      if (limit > 300 && config.advanced.mempool.maxmempool > limit) {
        config.advanced.mempool.maxmempool = limit
      }
      return { result: config };
    },
  }
};