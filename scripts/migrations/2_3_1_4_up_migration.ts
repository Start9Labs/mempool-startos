import { matches, types as T, YAML } from "../deps.ts";
const { shape, boolean } = matches;

const matchElectrs = shape({
  "enable-electrs": boolean,
});

export const migration_up_2_3_1_4: T.ExpectedExports.migration = async (
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

    if (!matchElectrs.test(parsed)) {
      return { result: { configured: false } };
    }
    return { result: { configured: true } };
  } catch {
    return { result: { configured: true } };
  }
};
