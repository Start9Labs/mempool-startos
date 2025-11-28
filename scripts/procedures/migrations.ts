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

            const matchIndexer = shape({
              "indexer": shape({
                type: string,
              }),
            });

            // Falls "enable-electrs" gesetzt ist, setze es auf true
            if (!matchElectrs.test(config)) {
              config["enable-electrs"] = true;
              return config;
            }

            // Falls "indexer" nicht gesetzt oder "none" ist, setze auf "electrs"
            if (matchIndexer.test(config)) {
              if (config.indexer.type === "none") {
                config.indexer.type = "electrs";
              }
            } else {
              config.indexer = { type: "electrs" };
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
            const matchIndexer = shape({
              "indexer": shape({
                type: string,
              }),
            });

            if (matchElectrs.test(config)) {
              delete config["enable-electrs "];
              return config;
            }

            // Wenn der Indexer "electrs" oder "fulcrum" ist, entferne die Konfiguration
            if (matchIndexer.test(config)) {
              if (config.indexer && (config.indexer.type === "electrs" || config.indexer.type === "fulcrum")) {
                delete config.indexer;
              }
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
            const matchIndexer = shape({
              indexer: shape({
                type: string,
              }),
            });

            // Falls der Indexer auf "none" oder leer gesetzt ist, setze auf "electrs" (oder "fulcrum")
            if (matchIndexer.test(config)) {
              if (config.indexer.type === "none" || !config.indexer.type) {
                config.indexer.type = "electrs"; // Hier könnte auch "fulcrum" gesetzt werden, je nach Bedarf
              }
            } else {
              config.indexer = { type: "electrs" }; // Default auf Electrs, kannst auch Fulcrum als Standard setzen
            }

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
