import { setupProperties } from '@start9labs/start-sdk/lib/properties'
import { WrapperData } from '../wrapperData'
import { PropertyString } from '@start9labs/start-sdk/lib/properties/PropertyString'
import { PropertyGroup } from '@start9labs/start-sdk/lib/properties/PropertyGroup'

/**
 * With access to WrapperData, in this function you determine what to include in the Properties section of the UI
 */
export const properties = setupProperties<WrapperData>(
  async ({ wrapperData }) => {
    return []
  },
)
