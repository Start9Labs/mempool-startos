import { VersionGraph } from '@start9labs/start-sdk'
import { v_3_3_1_1 } from './v3.3.1_1'
import { v_3_3_1_2 } from './v3.3.1_2'

export const versionGraph = VersionGraph.of({
  current: v_3_3_1_2,
  other: [v_3_3_1_1],
})
