import { matches, types as T, YAML } from "../deps.ts";
const { shape, string } = matches;

const matchIndexer = shape({
  indexer: shape({
    type: string,
  }),
});

export const migration_down_3_2_1_3: T.ExpectedExports.migration = async (
  effects,
  _version
) => {
  try {
    const configRaw = await effects.readFile({
      volumeId: "main",
      path: "start9/config.yaml",
    }).catch(() => null);

    if (!configRaw) return { result: { configured: false } };

    const parsed = YAML.parse(configRaw);

    // Keep electrs
    if (parsed.indexer?.type === "fulcrum") {
      // Remove fulcrum to revert to old version compatibility
      delete parsed.indexer;
    }

    await effects.writeFile({
      volumeId: "main",
      path: "start9/config.yaml",
      data: YAML.stringify(parsed),
    });

    return { result: { configured: false } };
  } catch {
    return { result: { configured: false } };
  }
};
