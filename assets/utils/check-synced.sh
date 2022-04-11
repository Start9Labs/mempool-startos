#!/bin/bash

set -e

b_type=$(yq e '.bitcoind.type' /root/start9/config.yaml)
if [ "$b_type" = "internal" ]; then
    b_host="bitcoind.embassy"
    b_username=$(yq e '.bitcoind.user' /root/start9/config.yaml)
    b_password=$(yq e '.bitcoind.password' /root/start9/config.yaml)
else
    b_host="btc-rpc-proxy.embassy"
    b_username=$(yq e '.bitcoind.user' /root/start9/config.yaml)
    b_password=$(yq e '.bitcoind.password' /root/start9/config.yaml)
fi
b_gbc_result=$(curl -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getblockcount", "params": []}' -H 'content-type: text/plain;' http://$b_host:8332/)
error_code=$?
if [ $error_code -ne 0 ]; then
    echo $b_gbc_result >&2
    exit $error_code
fi

b_block_count=$(echo "$b_gbc_result" | yq e '.result' -)
b_gbc_err=$(echo "$b_gbc_result" | yq e '.error' -)
if [ "$b_block_count" = "null" ]; then
    # Starting
    exit 60
else
    echo "Catching up to blocks from bitcoind. This should take at most a day." >&2
    exit 61
fi