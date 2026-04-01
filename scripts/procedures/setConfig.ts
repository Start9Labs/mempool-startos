import { compat, types as T } from "../deps.ts";

// Define a custom type for T.Config to include the 'lightning' and 'indexer' properties
interface CustomConfig extends T.Config {
  lightning?: {
    type?: string;  // Lightning node type (lnd, cln, etc.)
  };
  indexer?: {
    type?: string;  // Indexer type (electrs, fulcrum)
  };
}

// deno-lint-ignore require-await
export const setConfig: T.ExpectedExports.setConfig = async (
  effects: T.Effects,
  newConfig: CustomConfig
) => {
  // Set dependencies based on indexer type (Electrs or Fulcrum)
  const dependsOnElectrs: { [key: string]: string[] } = newConfig?.indexer?.type === "electrs"
    ? { electrs: ["synced"] }
    : {};

  const dependsOnFulcrum: { [key: string]: string[] } = newConfig?.indexer?.type === "fulcrum"
    ? { fulcrum: ["synced"] }
    : {};

  // Set dependencies based on lightning type (LND or CLN)
  const depsLnd: { [key: string]: string[] } = newConfig?.lightning?.type === "lnd"
    ? { lnd: [] }
    : {};

  const depsCln: { [key: string]: string[] } = newConfig?.lightning?.type === "cln"
    ? { "c-lightning": [] }
    : {};

  // Return the final configuration with all dependencies
  return compat.setConfig(effects, newConfig, {
    ...dependsOnElectrs,    // Electrs dependencies (if applicable)
    ...dependsOnFulcrum,    // Fulcrum dependencies (if applicable)
    ...depsLnd,             // LND dependencies (if applicable)
    ...depsCln,             // CLN dependencies (if applicable)
  });
};
