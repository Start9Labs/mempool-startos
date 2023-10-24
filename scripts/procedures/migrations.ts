import { types as T, rangeOf } from "../deps.ts"
import { migration_down_2_3_1_4 } from "../migrations/2_3_1_4_down_migration.ts";
import { migration_up_2_3_1_4 } from "../migrations/2_3_1_4_up_migration.ts";
import { migration_down_2_5_0 } from "../migrations/2_5_0_down_migration.ts";
import { migration_up_2_5_0 } from "../migrations/2_5_0_up_migration.ts";

export const migration: T.ExpectedExports.migration = async (effects, version) => {

  // from migrations (upgrades)
  if (rangeOf('<2.3.1.4').check(version)) {
    const result = await migration_up_2_3_1_4(effects, version)
    return result
  }

  if (rangeOf('<2.5.0').check(version)) {
    const result = await migration_up_2_5_0(effects, version)
    return result
  }

  // to migrations (downgrades)
  if (rangeOf('>2.3.1.4').check(version)) {
    const result = await migration_down_2_3_1_4(effects, version)
    return result
  }

  if (rangeOf('>2.5.0').check(version)) {
    const result = await migration_down_2_5_0(effects, version)
    return result
  }

  return { result: { configured: true } }

}