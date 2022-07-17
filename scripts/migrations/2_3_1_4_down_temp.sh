#!/bin/bash

set -ea
    yq -i 'del(."enable-electrs")' /root/start9/config.yaml
    echo '{"configured": true }'
    exit 0
fi
