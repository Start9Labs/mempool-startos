import { VersionGraph } from '@start9labs/start-sdk'
import { v_3_3_1_3 } from './v3.3.1_3'
import { v_3_3_1_5 } from './v3.3.1_5'

export const versionGraph = VersionGraph.of({
  current: v_3_3_1_5,
  other: [v_3_3_1_3],
})
