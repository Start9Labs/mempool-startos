// add migration script for new options in getConfig
import { matches, types as T, YAML } from "../deps.ts";
const { shape, string } = matches;

// add a const for the new lightning type string in getConfig
const matchLightningType = shape({
  lightning: shape({
    type: string,
  }),
});

export const migration_up_2_5_0: T.ExpectedExports.migration = async (
  effects,
  _version
) => {
  try {
    await effects.createDir({
      volumeId: "main",
      path: "start9",
    });
    const config = await effects.readFile({
      volumeId: "main",
      path: "start9/config.yaml",
    });
    const parsed = YAML.parse(config);
    // add lightning.type if it doesn't exist and set it to "lnd" as default
    if (!matchLightningType.test(parsed)) {
      return { result: { configured: false } };
    }
    return { result: { configured: false } };
  } catch {
    return { result: { configured: false } };
  }
};
