import { sdk } from '../../sdk'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  lightning: Value.select({
    name: 'Lightning Node',
    description:
      'Use this setting to select the Lightning node used to serve network data to the Lightning tab in Mempool.',
    default: 'none',
    values: {
      lnd: 'LND',
      cln: 'Core Lightning',
      none: 'None',
    },
  }),
  electrs: Value.toggle({
    name: 'Enable Electrs Address Lookups',
    description: 'Enables address lookups via an internal electrs instance',
    default: true,
  }),
})

export const matchConfigSpec = inputSpec.validator
export type ConfigSpec = typeof matchConfigSpec._TYPE
