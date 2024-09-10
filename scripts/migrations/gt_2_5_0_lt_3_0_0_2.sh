#!/bin/bash

set -ea

# up migration
if [ $1 = "from" ]; then 
    # Record system memory info to read for bitcoin auto config
    SYSTEM_MEM_INFO=$(awk '/MemTotal/{print $(NF-1)}' /proc/meminfo)
    SYSTEM_MEM_FILE=/root/start9/system_mem_info

    if [ -f "$SYSTEM_MEM_FILE" ]
    then
        echo "$SYSTEM_MEM_INFO" > "$SYSTEM_MEM_FILE"
    else
        touch /root/start9/system_mem_info
        echo "$SYSTEM_MEM_INFO" > "$SYSTEM_MEM_FILE"
    fi
    echo '{"configured": true }'
    
    exit 0
# down migration
elif [ $1 = "to" ]; then
    rm /root/start9/system_mem_info
    echo '{"configured": true }'
    exit 0
else
    echo "FATAL: Invalid argument: {from, to}. Migration failed." >&2
    exit 1
fi