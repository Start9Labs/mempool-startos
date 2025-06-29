# Mempool

Mempool is an open-source explorer developed for the Bitcoin community, focusing on the emerging transaction fee market to help our transition into a multi-layer ecosystem.

## Configuration

Mempool running on StartOS requires a fully synced archival Bitcoin Core node to function.

You can optionally enable the Lightning Tab. This requires you to have either LND or Core Lightning running on your Start9 Server.

## Lightning

Enable the lightning tab in the Mempool interface by running `Actions > Enable Lightning`. From this, select the desired lightning node implementation.

Once the Lightning tab is enabled, you are able to see information across the entire lightning network, including statistics about your own lightning node. Choosing LND or Core Lightning provide similar network data, but may have different quantities of historical data depending on the age of your lightning node.

## Mining

The Mining tab provides network information about bitcoin mining statistics and 3rd party information about known mining pools connected to each confirmed block.

## Address Lookups

To enable address lookups, toggle on `Actions > Enable Address Lookups` for electrs.

You will need electrs to be installed and synced before this feature will work. Also, lookups may be slow or time out altogether while the service is still warming up, or if there are too many other things running on your system.

## Acceleration

Accelerating mempool transactions allows them to be prioritized by mining pools thus reducing the wait time for the first confirmation. Visit an unconfirmed transaction in the mempool interface and select the "Accelerate" button near ETA. Follow the on-screen instructions to increase the sat/vB and submit payment via lightning invoice.

## Support

For additional support, please read the mempool documentation on the documentation tab, or visit the [mempool.space matrix support room](https://matrix.to/#/%23mempool:bitcoin.kyoto).
