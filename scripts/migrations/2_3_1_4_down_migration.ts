import { types as T, matches, YAML } from "../deps.ts"

const { shape, boolean } = matches

const matchElectrs = shape({
    "enable-electrs ": boolean,
}, ["enable-electrs "])

export const migration_down_2_3_1_4: T.ExpectedExports.migration = async (effects, _version) => {
    await effects.createDir({
        volumeId: "main",
        path: "start9"
    })
    const config = await effects.readFile({
        volumeId: "main",
        path: "start9/config.yaml"
    })
    const parsed = YAML.parse(config)

    if (matchElectrs.test(parsed)) {
        delete parsed["enable-electrs "]
    }

    return { result: { configured: true } }
}