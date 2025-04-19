import { types as T, rangeOf, compat } from "../deps.ts";
import { migration_down_2_3_1_4 } from "../migrations/2_3_1_4_down_migration.ts";
import { migration_up_2_3_1_4 } from "../migrations/2_3_1_4_up_migration.ts";
import { migration_down_2_5_0 } from "../migrations/2_5_0_down_migration.ts";
import { migration_up_2_5_0 } from "../migrations/2_5_0_up_migration.ts";

const current = "3.2.1";

export const migration: T.ExpectedExports.migration = async (
  effects: T.Effects,
  version: string,
  ...args: unknown[]
) => {
  // from migrations (upgrades)
  if (rangeOf("<2.3.1.4").check(version)) {
    const result = await migration_up_2_3_1_4(effects, version);
    return result;
  }

  if (rangeOf("<2.5.0").check(version)) {
    const result = await migration_up_2_5_0(effects, version);
    return result;
  }

  // to migrations (downgrades)
  if (rangeOf(">2.3.1.4 <2.5.0").check(version)) {
    const result = await migration_down_2_3_1_4(effects, version);
    return result;
  }

  if (rangeOf(">2.5.0 <=3.0.0.3").check(version)) {
    const result = await migration_down_2_5_0(effects, version);
    return result;
  }

  return compat.migrations.fromMapping(
    {
      "3.2.1": {
        up: compat.migrations.updateConfig(
          (config) => {
            return config;
          },
          true,
          { version: "3.2.1", type: "up" }
        ),
        down: () => {
          throw new Error("Downgrades are prohibited from this version");
        },
      },
    },
    current
  )(effects, version, ...args);
};
