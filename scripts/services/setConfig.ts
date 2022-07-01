import { compat, types as T } from "../deps.ts";

// deno-lint-ignore require-await
export const setConfig: T.ExpectedExports.setConfig = async (
  effects: T.Effects,
  newConfig: T.Config,
) => {
  const dependsOnElectrs: { [key: string]: string[] } =
    newConfig?.["enable-electrs"] ? { electrs: ["synced"] } : {};
  const dependsOnBitcoind: { [key: string]: string[] } = newConfig?.txindex
    ? { bitcoind: [] }
    : {};

  return compat.setConfig(effects, newConfig, {
    ...dependsOnElectrs,
    ...dependsOnBitcoind,
  });
};
