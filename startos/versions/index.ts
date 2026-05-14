import { VersionGraph } from '@start9labs/start-sdk'
import { v_3_3_1_3 } from './v3.3.1_3'
import { v_3_3_1_4 } from './v3.3.1_4'

export const versionGraph = VersionGraph.of({
  current: v_3_3_1_4,
  other: [v_3_3_1_3],
})
