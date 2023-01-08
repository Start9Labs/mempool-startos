# Mempool.space 

Mempool is an open-source explorer developed for the Bitcoin community, focusing on the emerging transaction fee market to help our transition into a multi-layer ecosystem. 
## Configuration

Mempool on the Embassy requires a fully synced archival Bitcoin Core node to function.

This implementation of Mempool on Embassy enables you to connect to your own Bitcoin Core node.

## Address Lookups

To enable address lookups, select either electrs or fulcrum from the "Enable Address Lookups" drop-down list in the configuration menu.

You will need electrs or fulcrum to be installed and synced before this feature will work. Also, lookups may be slow or time out altogether while the service is still warming up, or if there are too many other things running on your system.

**ATTENTION: Address lookups on electrs are an alpha feature. If electrs' health check is failing consistently even after it's fully synced, or if address lookups in mempool are timing out consistently, try restarting electrs, wait for it to finish syncing, and then try looking up an address again.**

## Support

For additional support, please visit the mempool.space matrix support room.
