import { VersionGraph } from '@start9labs/start-sdk'
import { v_3_3_1_3 } from './v3.3.1_3'
import { v_3_3_1_6 } from './v3.3.1_6'

export const versionGraph = VersionGraph.of({
  current: v_3_3_1_6,
  other: [v_3_3_1_3],
})
