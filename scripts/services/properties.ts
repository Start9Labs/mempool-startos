import { Effects, ExpectedExports, YAML } from "../deps.ts";

export const properties: ExpectedExports.properties = async (
  effects: Effects,
) => {
  try {
    await effects.metadata({
      path: "start9/stats.yaml",
      volumeId: "main",
    })
  } catch {
    return {
      result: {
        version: 2,
        data: {
          "Not Ready": {
            type: "string",
            value: "Could not find properties. The service might still be starting",
            qr: false,
            copyable: false,
            masked: false,
            description: "Fallback Message When Properties could not be found"
          }
        }
      }
    }
  }
  return {
    result: YAML.parse(
      await effects.readFile({
        path: "start9/stats.yaml",
        volumeId: "main",
      }),
    ) as any,
  };
};
