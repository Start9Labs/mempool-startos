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
TXINDEX_CHECK=$(curl -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getindexinfo", "params": ["txindex"]}' -H 'content-type: text/plain;' $b_host:8332 | sed -n 's/.*\("synced":true\).*/1/p') 
TXINDEX_SYNC=$(curl -sS --user mempool:mempool --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getindexinfo", "params": ["txindex"]}' -H 'content-type: text/plain;' btc-rpc-proxy.embassy:8332 | sed -n 's/.*\("synced":false\).*/1/p')
check_sync(){
    DURATION=$(</dev/stdin)
    if (($DURATION <= 5000 )); then
        exit 60
    elif test "$TXINDEX_SYNC" != 1; then
        echo "Transaction Indexer is still syncing. Mempool will not display correctly until sync is complete." >&2
        exit 61
    elif test "$TXINDEX_CHECK" != 1; then
        echo "Transaction Indexer is either not enabled. Mempool will not display completely." >&2
        exit 1
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

# Below is an example of the curl command being used to pull the txindex information from bitcoind. 
## curl -sS --user mempool:mempool --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getindexinfo", "params": ["txindex"]}' -H 'content-type: text/plain;' btc-rpc-proxy.embassy:8332 | sed -n 's/.*\("synced":false\).*/2/p'