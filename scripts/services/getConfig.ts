import { compat, types as T } from "../deps.ts";

export const getConfig: T.ExpectedExports.getConfig = compat.getConfig({
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
    "description":
      "The Bitcoin Core node to connect to",
    "tag": {
      "id": "type",
      "name": "Type",
      "variant-names": {
        "internal": "Bitcoin Core",
        "internal-proxy": "Bitcoin Proxy",
      },
      "description":
        "The Bitcoin Core node to connect to",
    },
    "default": "internal",
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
          "selector": "$.rpc.username",
        },
        "password": {
          "type": "pointer",
          "name": "RPC Password",
          "description": "The password for Bitcoin Core's RPC interface",
          "subtype": "package",
          "package-id": "bitcoind",
          "target": "config",
          "multi": false,
          "selector": "$.rpc.password",
        },
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
          "selector": '$.users[?(@.name == "mempool")].name',
        },
        "password": {
          "type": "pointer",
          "name": "RPC Password",
          "description": "The password for the RPC user allocated to electrs",
          "subtype": "package",
          "package-id": "btc-rpc-proxy",
          "target": "config",
          "multi": false,
          "selector": '$.users[?(@.name == "mempool")].password',
        },
        "txindex": {
          "name": "Transaction Indexer",
          "description": "The Transaction Indexer for Bitcoin Core",
          "type": "pointer",
          "subtype": "package",
          "package-id": "bitcoind",
          "target": "config",
          "multi": false,
          "selector": "$.txindex",
        },
      },
    },
  },
  "lightning": {
    "type": "union",
    "name": "Lightning Node",
    "description":
      "The Lightning node you will connect to in order to serve network data to the Lightning tab in Mempool",
    "tag": {
      "id": "type",
      "name": "Select Lightning Node",
      "variant-names": {
        "none": "Disabled",
        "lnd": "LND",
        "cln": "Core Lightning",
      },
      "description":
        "The Lightning node you will connect to in order to serve network data to the Lightning tab in Mempool",
    },
    "default": "none",
    "variants": {
      "none": {},
      "lnd": {},
      "cln": {},
    }
  },
  "enable-electrs": {
    "name": "Enable Electrs Address Lookups",
    "description": "Enables address lookups via an internal electrs instance",
    "type": "boolean",
    "default": true,
  }
});