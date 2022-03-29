#!/bin/bash

set -e

b_type=$(yq e '.bitcoind.type' /root/start9/config.yaml)
if [ "$b_type" = "internal" ]; then
    b_host="bitcoind.embassy"
    b_username=$(yq e '.bitcoind.user' /root/start9/config.yaml)
    b_password=$(yq e '.bitcoind.password' /root/start9/config.yaml)
elif [ "$b_type" = "internal-proxy" ]; then
    b_host="btc-rpc-proxy.embassy"
    b_username=$(yq e '.bitcoind.user' /root/start9/config.yaml)
    b_password=$(yq e '.bitcoind.password' /root/start9/config.yaml)
else
    b_host=$(yq e '.bitcoind.host' /root/start9/config.yaml)
    b_username=$(yq e '.bitcoind.user' /root/start9/config.yaml)
    b_password=$(yq e '.bitcoind.password' /root/start9/config.yaml)
fi
b_gbc_result=$(bitcoin-cli -rpcconnect=$b_host -rpcuser=$b_username -rpcpassword=$b_password getblockcount)
error_code=$?
if [ $error_code -ne 0 ]; then
    echo $b_gbc_result >&2
    exit $error_code
fi

blockheight=$(echo "$c_gi_result" | yq e '.blockheight' -)
echo "Catching up to blocks from bitcoind. This may take several hours. Progress: $blockheight of $b_gbc_result blocks" >&2
exit 61
