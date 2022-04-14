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
TXINDEX_CHECK=$(curl -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getindexinfo", "params": ["txindex"]}' -H 'content-type: text/plain;' $b_host:8332 | sed -n 's/.*\("synced":\).*/1/p') 
TXINDEX_SYNC=$(curl -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getindexinfo", "params": ["txindex"]}' -H 'content-type: text/plain;' $b_host:8332 | sed -n 's/.*\("synced":true\).*/1/p')
IBD_STATE=$(curl -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getblockchaininfo", "params": []}' -H 'content-type: text/plain;' $b_host:8332 | sed -n 's/.*\("initialblockdownload":false\).*/1/p')

check_sync(){
    DURATION=$(</dev/stdin)
    if (($DURATION <= 5000 )); then
        exit 60
    elif test "$IBD_STATE" != 1; then
        echo "Initial blockchain download still in progress. Mempool will not display correctly until this is complete." >&2
        exit 61
    elif test "$TXINDEX_CHECK" != 1; then
        echo "Transaction Indexer is not enabled. Mempool will not display properly." >&2
        exit 1
    elif test "$TXINDEX_SYNC" != 1; then
        echo "Transaction Indexer is still syncing. Mempool will not display correctly until sync is complete." >&2
        exit 61
    fi
}

case "$1" in
	sync)
        check_sync
        ;;
    *)
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "         sync"
esac