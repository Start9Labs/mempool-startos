import { matches, types as T, YAML } from "../deps.ts";
const { shape, string } = matches;

const matchIndexer = shape({
  indexer: shape({
    type: string,
  }),
});

export const migration_up_3_2_1_3: T.ExpectedExports.migration = async (
  effects,
  _version
) => {
  try {
    // Ensure the start9 directory exists
    await effects.createDir({ volumeId: "main", path: "start9" });

    const configRaw = await effects.readFile({
      volumeId: "main",
      path: "start9/config.yaml",
    }).catch(() => null);

    if (!configRaw) return { result: { configured: false } };

    const parsed = YAML.parse(configRaw);

    // If indexer exists and is electrs, keep it
    if (parsed.indexer?.type === "electrs") {
      // Do nothing, electrs stays
    }

    // Otherwise (no indexer or fulcrum), do nothing
    // Fulcrum must be manually set by the user

    await effects.writeFile({
      volumeId: "main",
      path: "start9/config.yaml",
      data: YAML.stringify(parsed),
    });

    return { result: { configured: false } };
  } catch (_e) {
    return { result: { configured: false } };
  }
};
