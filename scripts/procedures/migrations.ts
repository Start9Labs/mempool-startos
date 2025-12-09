import { types as T, compat, matches } from "../deps.ts";

const { shape, boolean, string } = matches;

const current = "3.2.1.3";

export const migration: T.ExpectedExports.migration = (
  effects: T.Effects,
  version: string,
  ...args: unknown[]
) => {
  return compat.migrations.fromMapping(
    {
      "2.3.1.4": {
        up: compat.migrations.updateConfig(
          (config) => {
            const matchElectrs = shape({
              "enable-electrs": boolean,
            });
            if (!matchElectrs.test(config)) {
              config["enable-electrs"] = true;
              return config;
            }
            return config;
          },
          false,
          { version: "2.3.1.4", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config) => {
            const matchElectrs = shape(
              {
                "enable-electrs ": boolean,
              },
              ["enable-electrs "]
            );
            if (matchElectrs.test(config)) {
              delete config["enable-electrs "];
              return config;
            }
            return config;
          },
          true,
          { version: "2.3.1.4", type: "down" }
        ),
      },
      "2.5.0": {
        up: compat.migrations.updateConfig(
          (config) => {
            const matchLightningType = shape({
              lightning: shape({
                type: string,
              }),
            });
            if (!matchLightningType.test(config)) {
              (config as typeof matchLightningType._TYPE).lightning.type =
                "lnd";
              return config;
            }
            return config;
          },
          false,
          { version: "2.5.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config) => {
            const matchLightningType = shape({
              lightning: shape({
                type: string?.optional(),
              }),
            });
            if (matchLightningType.test(config)) {
              if (config.lightning) {
                delete config.lightning["type"];
                return config;
              }
            }
            return config;
          },
          true,
          { version: "2.5.0", type: "down" }
        ),
      },
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
      "3.2.1.3": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            if (config["enable-electrs"]) {
              config.indexer = { type: "electrs" };
            } else {
              config.indexer = { type: "none" };
            }
            delete config["enable-electrs"];
            return config;
          },
          true,
          { version: "3.2.1.3", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config) => {
            if (
              matches
                .shape({
                  indexer: matches.shape({ type: matches.any }),
                })
                .test(config)
            ) {
              if (config.indexer.type === "electrs") {
                config["enable-electrs"] = true;
              } else {
                config["enable-electrs"] = false;
              }
            }
            delete config.indexer;
            return config;
          },
          true,
          { version: "3.2.1.3", type: "down" }
        ),
      },
    },
    current
  )(effects, version, ...args);
};
