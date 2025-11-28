# Mempool 

Mempool is an open-source explorer developed for the Bitcoin community, focusing on the emerging transaction fee market to help our transition into a multi-layer ecosystem. 

## Configuration

Mempool on the Start9 Server requires a fully synced archival Bitcoin Core node to function.

This implementation of Mempool on the Start9 Server enables you to connect to your own Bitcoin Core node.

As of Mempool v2.5.0, you can optionally enable the Lightning Tab. This requires you to have either LND or Core Lightning running on your Start9 Server.

## Lightning

Once the Lightning tab is enabled, you are able to see information across the entire lightining network, including statistics about your own lightning node. Choosing LND or Core Lightning provide similar network data, but may have different quantities of historical data depending on the age of your lightning node. 

## Mining

The Mining tab provides network information about bitcoin mining statistics and 3rd party information about known mining pools connected to each confirmed block. 

## Address Lookups

To enable address lookups, toggle on the "Enable Electrs or Fulcrum Address Lookups" option in the configuration menu.

You will need electrs or fulcrum to be installed and synced before this feature will work. Also, lookups may be slow or time out altogether while the service is still warming up, or if there are too many other things running on your system.

## Acceleration

Accelerating mempool transactions allows them to be prioritized by mining pools thus reducing the wait time for the first confirmation. Visit an unconfirmed transaction in the mempool interface and select the "Accelerate" button near ETA. Follow the on-screen instructions to increase the sat/vB and submit payment via lightning invoice.

## Support

For additional support, please read the mempool documentation on the documentation tab, or visit the [mempool.space matrix support room](https://matrix.to/#/%23mempool:bitcoin.kyoto).
