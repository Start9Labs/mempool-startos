import { compat, types as T } from "../deps.ts";

// Define a custom type for T.Config to include the 'lightning' property with a 'type' property
interface CustomConfig extends T.Config {
  lightning?: {
    type?: string;
  };
}
// deno-lint-ignore require-await
export const setConfig: T.ExpectedExports.setConfig = async (
  effects: T.Effects,
  newConfig: CustomConfig
) => {
  const dependsOnElectrs: { [key: string]: string[] } = newConfig?.[
    "enable-electrs"
  ]
    ? { electrs: ["synced"] }
    : {};
  const dependsOnBitcoind: { [key: string]: string[] } = newConfig?.txindex
    ? { bitcoind: [] }
    : {};

    // add two const depsLnd and depsCln for the new lightning type string in getConfig
  const depsLnd: { [key: string]: string[] } = newConfig?.lightning?.type === "lnd"  ? {lnd: []} : {};
  const depsCln: { [key: string]: string[] } = newConfig?.lightning?.type === "cln"  ? {"c-lightning": []} : {};
    
  return compat.setConfig(effects, newConfig, {
    ...dependsOnElectrs,
    ...dependsOnBitcoind,
    ...depsLnd,
    ...depsCln,
  });
};
