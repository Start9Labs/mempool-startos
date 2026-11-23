import { configJson } from '../fileModels/mempool-config.json'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { selectedNode } from '../utils'
const { InputSpec, Value, Variants } = sdk

const nodeInputSpec = InputSpec.of({
  node: Value.union({
    name: i18n('Bitcoin Node'),
    description: i18n(
      '- Bitcoin on this server: the Bitcoin service installed on this server, reached through its RPC cookie.\n- rbitcoin on this server: the rbitcoin service installed on this server, reached through its RPC cookie. It must not be pruned.\n- External node: a Bitcoin Core node on another machine, reached over RPC with a username and password.\nA Bitcoin Core node must be archival (prune=0) with transaction indexing (txindex=1).',
    ),
    warning: i18n(
      'Mempool keeps its network setting, database and cache when changing nodes. A different network or chain needs a fresh installation configured for that network. Clear Backend Cache does not erase the database.',
    ),
    default: 'bitcoind',
    variants: Variants.of({
      bitcoind: {
        name: i18n('Bitcoin on this server (recommended)'),
        spec: InputSpec.of({}),
      },
      rbitcoin: {
        name: i18n('rbitcoin on this server'),
        spec: InputSpec.of({}),
      },
      external: {
        name: i18n('External node'),
        spec: InputSpec.of({
          host: Value.text({
            name: i18n('Host'),
            description: i18n(
              'The address of the node as this server reaches it: an IP address or hostname, without a scheme or port. Mempool talks to it over plain HTTP, so the RPC password and every response cross the network unencrypted: use a node on the same local network, never a public address.',
            ),
            default: null,
            required: true,
            placeholder: '192.168.1.10',
          }),
          port: Value.number({
            name: i18n('RPC Port'),
            description: i18n(
              "The port of the node's JSON-RPC interface (8332 on mainnet by default).",
            ),
            default: 8332,
            required: true,
            min: 1,
            max: 65535,
            integer: true,
          }),
          username: Value.text({
            name: i18n('RPC Username'),
            description: i18n(
              "A user from an rpcauth or rpcuser line in the node's bitcoin.conf. The node must also admit this server: rpcbind and rpcallowip in that file.",
            ),
            default: null,
            required: true,
          }),
          password: Value.text({
            name: i18n('RPC Password'),
            description: i18n('The password that goes with the username.'),
            default: null,
            required: true,
            masked: true,
          }),
        }),
      },
    }),
  }),
})

export const selectNode = sdk.Action.withInput(
  'select-node',

  {
    name: i18n('Bitcoin Node'),
    description: i18n(
      'Choose the Bitcoin node Mempool reads blocks, transactions and the mempool from: the Bitcoin or rbitcoin service on this server, or a node you run elsewhere.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  // form input specification
  nodeInputSpec,

  // pre-fill the form: the choice from StartOS state, the external address and
  // credentials from where the backend reads them
  async ({ effects }) => {
    const node = await selectedNode(effects)
    if (node !== 'external') return { node: { selection: node } }
    const rpc = await configJson.read((c) => c.CORE_RPC).const(effects)
    return {
      node: {
        selection: 'external' as const,
        value: {
          host: rpc?.HOST ?? '',
          port: rpc?.PORT ?? 8332,
          username: rpc?.USERNAME ?? '',
          password: rpc?.PASSWORD ?? '',
        },
      },
    }
  },

  // the execution function. The choice is StartOS state; an external node's
  // address and credentials go straight into CORE_RPC, which init/watchHosts
  // then leaves alone. Choosing a node on this server clears the credentials
  // and restores cookie auth; watchHosts resolves the bridge address. The old
  // address goes in the same write, before the choice changes, so a cookie is
  // never sent to the node Mempool is leaving: until watchHosts writes the new
  // address the backend falls back to loopback. Re-saving the current node
  // keeps its address, because watchHosts would not run to restore it.
  async ({ effects, input }) => {
    if (input.node.selection === 'external') {
      const { host, port, username, password } = input.node.value
      await configJson.merge(effects, {
        CORE_RPC: {
          HOST: host,
          PORT: port,
          USERNAME: username,
          PASSWORD: password,
          COOKIE: false,
        },
      })
      await storeJson.merge(effects, { node: 'external' })
    } else {
      const next = input.node.selection
      const current = (await storeJson.read((s) => s.node).once()) ?? 'bitcoind'
      await configJson.update(
        effects,
        async (config) =>
          config && {
            ...config,
            CORE_RPC: {
              ...config.CORE_RPC,
              ...(current !== next && { HOST: undefined }),
              USERNAME: '',
              PASSWORD: '',
              COOKIE: true,
            },
          },
      )
      await storeJson.merge(effects, { node: next })
    }
  },
)
