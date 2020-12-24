import { readdirSync } from 'fs'
import { resolve } from 'path'

import { TPacyPlugin } from '..'
const pluginNames = readdirSync(__dirname).map((name) => resolve(__dirname, name))

export default function presetDefault() {
  return function (api) {
    api.applyPlugins(pluginNames)
  } as TPacyPlugin
}
