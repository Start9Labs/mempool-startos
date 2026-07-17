import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_3_3_1_3 } from './v3.3.1_3'
import { v_3_3_1_17 } from './v3.3.1_17'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_3_3_1_3, v_3_3_1_17],
})
