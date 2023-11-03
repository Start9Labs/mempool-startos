import { matches, types as T, YAML } from "../deps.ts";
const { shape, string } = matches;

// add a const for the new lightning type string in getConfig
const matchLightningType = shape({
  lightning: shape({
    type: string?.optional(),
  }),
});

export const migration_down_2_5_0: T.ExpectedExports.migration = async (
  effects,
  _version,
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

    // delete lightning.type if exists in config
    if (matchLightningType.test(parsed)) {
      if (parsed.lightning) {
        delete parsed.lightning["type"];
      }
    }
    return { result: { configured: true } };
  } catch {
    return { result: { configured: true } };
  }
};
