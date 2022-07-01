import { ConfigRes, ExpectedExports, matches, YAML } from "../deps.ts";

const { any, string, dictionary } = matches;

const matchConfig = dictionary([string, any]);

export const getConfig: ExpectedExports.getConfig = async (effects) => {
  const config = await effects
    .readFile({
      path: "start9/config.yaml",
      volumeId: "main",
    })
    .then((x) => YAML.parse(x))
    .then((x) => matchConfig.unsafeCast(x))
    .catch((e) => {
      effects.warn(`Got error ${e} while trying to read the config`);
      return undefined;
    });
  const spec: ConfigRes["spec"] = {
    "tor-address": {
      "name": "Tor Address",
      "description": "The Tor address of the network interface",
      "type": "pointer",
      "subtype": "package",
      "package-id": "mempool",
      "target": "tor-address",
      "interface": "main",
    },
    "bitcoind": {
      "type": "union",
      "name": "Bitcoin Core",
      "description": "The Bitcoin Core node to connect to",
      "tag": {
        "id": "type",
        "name": "Type",
        "variant-names": {
          "internal": "Bitcoin Core",
          "internal-proxy": "Bitcoin Proxy"
        },
        "description": "The Bitcoin Core node to connect to"
      },
      "default": "internal-proxy",
      "variants": {
        "internal": {
          "user": {
            "type": "pointer",
            "name": "RPC Username",
            "description": "The username for Bitcoin Core's RPC interface",
            "subtype": "package",
            "package-id": "bitcoind",
            "target": "config",
            "multi": false,
            "selector": "$.rpc.username"
          },
          "password": {
            "type": "pointer",
            "name": "RPC Password",
            "description": "The password for Bitcoin Core's RPC interface",
            "subtype": "package",
            "package-id": "bitcoind",
            "target": "config",
            "multi": false,
            "selector": "$.rpc.password"
          }
        },
        "internal-proxy": {
          "user": {
            "type": "pointer",
            "name": "RPC Username",
            "description": "The username for the RPC user allocated to electrs",
            "subtype": "package",
            "package-id": "btc-rpc-proxy",
            "target": "config",
            "multi": false,
            "selector": "$.users[?(@.name == \"mempool\")].name"
          },
          "password": {
            "type": "pointer",
            "name": "RPC Password",
            "description": "The password for the RPC user allocated to electrs",
            "subtype": "package",
            "package-id": "btc-rpc-proxy",
            "target": "config",
            "multi": false,
            "selector": "$.users[?(@.name == \"mempool\")].password"
          },
          "txindex": {
            "name": "Transaction Indexer",
            "description": "The Transaction Indexer for Bitcoin Core",
            "type": "pointer",
            "subtype": "package",
            "package-id": "bitcoind",
            "target": "config",
            "multi": false,
            "selector": "$.txindex"
          },
        }
      }
    },
    "enable-electrs": {
      "name": "Enable Electrs Address Lookups",
      "description": "Enables address lookups via an internal electrs instance",
      "type": "boolean",
      "default": true,
    },
  };
  return {
    result: {
      config,
      spec,
    },
  };
};
