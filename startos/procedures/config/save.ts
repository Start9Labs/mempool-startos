import { sdk } from '../../sdk'
import { setInterfaces } from '../interfaces'

import { configSpec } from './spec'

/**
 * This function executes on config save
 *
 * Use it to persist config data to various files and to establish any resulting dependencies
 *
 * Hello Moon does not have config. See Hello World for an example
 */
export const save = sdk.setupConfigSave(
  configSpec,
  async ({ effects, utils, input, dependencies }) => {
    /** uncomment to make Hello World a conditional dependency */
    // await utils.store.setOwn('/config', input)
    // const deps = input.helloWorld ? [dependencies.running('hello-world')] : []
    // const dependenciesReceipt = await effects.setDependencies(deps)

    const dependenciesReceipt = await effects.setDependencies([
      dependencies.running('hello-world'),
    ])

    return {
      interfacesReceipt: await setInterfaces({ effects, utils, input }),
      dependenciesReceipt,
      restart: true,
    }
  },
)
