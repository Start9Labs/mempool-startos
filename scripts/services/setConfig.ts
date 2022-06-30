import {
  Config,
  Effects,
  ExpectedExports,
  matches,
  SetResult,
  YAML,
} from "../deps.ts";
const { number } = matches;

export const setConfig: ExpectedExports.setConfig = async (
  effects: Effects,
  newConfig: Config,
) => {
  await effects.createDir({
    path: "start9",
    volumeId: "main",
  });
  await effects.writeFile({
    path: "start9/config.yaml",
    toWrite: YAML.stringify(newConfig),
    volumeId: "main",
  });
  
  const dependsOnElectrs: {[key: string]: string[]} = !!newConfig?.['enable-electrs'] ? {electrs: ['synced']} : {}
  const dependsOnBitcoind: {[key: string]: string[]} =  !!newConfig?.txindex ? {bitcoind: []} : {}

  const result: SetResult = {
    signal: "SIGTERM",
    "depends-on": {
       ...dependsOnElectrs,
       ...dependsOnBitcoind,
    },
  };
  return { result };
};