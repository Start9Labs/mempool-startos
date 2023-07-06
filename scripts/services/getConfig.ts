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
  "bitcoin-user": {
      "type": "pointer",
      "name": "RPC Username",
      "description": "The username for Bitcoin Core's RPC interface",
      "subtype": "package",
      "package-id": "bitcoind",
      "target": "config",
      "multi": false,
      "selector": "$.rpc.username",
    },
  "bitcoin-password": {
    "type": "pointer",
    "name": "RPC Password",
    "description": "The password for Bitcoin Core's RPC interface",
    "subtype": "package",
    "package-id": "bitcoind",
    "target": "config",
    "multi": false,
    "selector": "$.rpc.password",
  },
  "bitcoin-txindex": {
    "name": "Transaction Indexer",
    "description": "The Transaction Indexer for Bitcoin Core",
    "type": "pointer",
    "subtype": "package",
    "package-id": "bitcoind",
    "target": "config",
    "multi": false,
    "selector": "$.txindex",
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