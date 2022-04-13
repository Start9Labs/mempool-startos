#!/bin/sh

CURRENT_HEIGHT=$(wget -q -O- https://blockchain.info/q/getblockcount; echo)
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
TXINDEX_CHECK=$(curl --silent --fail -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getrawtransaction", "params": [00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048]}' -H 'content-type: text/plain;' $b_host:8332/ | sed 's/[^0-9]*//g') 
SYNC_HEIGHT=$(curl --silent --fail -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getblockcount", "params": []}' -H 'content-type: text/plain;' $b_host:8332/ | sed 's/[^0-9]*//g') 
        
check_api(){
    DURATION=$(</dev/stdin)
    if (($DURATION <= 5000 )); then
        exit 60
    else
        curl --silent --fail "mempool.embassy:8999/api/v1/difficulty-adjustment" &>/dev/null
        RES=$?
        if test "$RES" != 0; then
            echo "Mempool API is unreachable" >&2
            exit 1
        fi
    fi
}

check_web(){
    DURATION=$(</dev/stdin)
    if (($DURATION <= 5000 )); then
        exit 60
    else
        curl --silent --fail mempool.embassy:8080 &>/dev/null
        RES=$?
        if test "$RES" != 0; then
            echo "The Mempool UI is unreachable" >&2
            exit 1
        fi
    fi
}

check_sync(){
    DURATION=$(</dev/stdin)
    if (($DURATION <= 5000 )); then
        exit 60
    else
        curl --silent --fail -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getblockcount", "params": []}' -H 'content-type: text/plain;' $b_host:8332/ | sed 's/[^0-9]*//g' &>/dev/null
        RES=$?
        if test "$RES" != 0; then
            echo "The Bitcoin Core is unreachable" >&2
            exit 1
        elif test "$SYNC_HEIGHT" -lt "$CURRENT_HEIGHT"; then
            echo "Bitcoin Core is still syncing, Mempool will not display completely until syncing is complete. Current block height: $SYNC_HEIGHT of $CURRENT_HEIGHT" >&2
            exit 61
        fi
    fi
}

case "$1" in
	sync)
        check_sync
        ;;
	api)
        check_api
        ;;
	web)
        check_web
        ;;
    *)
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "         api"
        echo "         web"
        echo "         sync"
esac