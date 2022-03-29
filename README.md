# Wrapper for Mempool

[mempool](http://mempool.space/) is a fully featured visualizer, explorer, and API service for the Bitcoin mempool, with a focus on the emerging transaction fee market to help our transition into a multi-layer ecosystem

## Dependencies

- [docker](https://docs.docker.com/get-docker)
- [docker-buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [yq](https://mikefarah.gitbook.io/yq)
- [toml](https://crates.io/crates/toml-cli)
- [make](https://www.gnu.org/software/make)
- [embassy-sdk]

## Cloning

Clone the project locally. Note the submodule link to the original project(s). 

```
git clone https://github.com/Start9Labs/mempoolwrapper.git
cd mempool-wrapper
git submodule update --init --recursive
```

## Building

To build the project, run the following commands:

```
make
```

## Installing (on Embassy)

SSH into an Embassy device.
`scp` the `.s9pk` to any directory from your local machine.

```
scp mempool.s9pk root@<LAN ID>:/tmp
```

Run the following command to determine successful install:

```
embassy-cli auth login
embassy-cli package install /tmp/mempool.s9pk
```
