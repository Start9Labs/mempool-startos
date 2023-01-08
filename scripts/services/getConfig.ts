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
          "description": "The username for the RPC user allocated to mempool",
          "subtype": "package",
          "package-id": "btc-rpc-proxy",
          "target": "config",
          "multi": false,
          "selector": '$.users[?(@.name == "mempool")].name',
        },
        "password": {
          "type": "pointer",
          "name": "RPC Password",
          "description": "The password for the RPC user allocated to mempool",
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
  "address-lookups": {
    "type": "enum",
    "name": "Enable Address Lookups",
    "description": "Enable Electrs or Fulcrum Address Lookups on Mempool",
    "values": ["disabled", "electrs", "fulcrum"],
    "value-names": {
      "disabled": "Disabled",
      "electrs": "Electrs",
      "fulcrum": "Fulcrum"
    },
    "default": "disabled"
  }

});
