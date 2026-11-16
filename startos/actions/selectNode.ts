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
      '- Bitcoin on this server: the Bitcoin service installed on this server, reached through its RPC cookie.\n- External node: a Bitcoin Core node on another machine, reached over RPC with a username and password.\nEither node must be archival (prune=0) with transaction indexing (txindex=1).',
    ),
    warning: i18n(
      "Mempool's database and cache were built from the node it read before. Point it at a node on a different network or chain only after running Clear Backend Cache, and expect a re-index.",
    ),
    default: 'bitcoind',
    variants: Variants.of({
      bitcoind: {
        name: i18n('Bitcoin on this server (recommended)'),
        spec: InputSpec.of({}),
      },
      external: {
        name: i18n('External node'),
        spec: InputSpec.of({
          host: Value.text({
            name: i18n('Host'),
            description: i18n(
              'The address of the node as this server reaches it: an IP address or hostname, without a scheme or port.',
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
      'Choose the Bitcoin node Mempool reads blocks, transactions and the mempool from: the Bitcoin service on this server, or a node you run elsewhere.',
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
    if (node !== 'external') return { node: { selection: 'bitcoind' as const } }
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
  // then leaves alone. Choosing this server's Bitcoin clears the credentials
  // and restores cookie auth; watchHosts resolves the bridge address.
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
      await storeJson.merge(effects, { node: 'bitcoind' })
      await configJson.merge(effects, {
        CORE_RPC: { USERNAME: '', PASSWORD: '', COOKIE: true },
      })
    }
  },
)
