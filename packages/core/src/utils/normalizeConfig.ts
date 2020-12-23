import cloneDeep from 'lodash.clonedeep'
import isPlainObj from 'is-plain-obj'
import * as nps from 'path'
import checkConfig, { PacyCoreConfig } from './checkConfig'
import toArray from './toArray'

export const __SINGLE_ENTRY_KEY = Symbol.for('__SINGLE_ENTRY_KEY')

export type NormalizedPacyCoreConfig = PacyCoreConfig & {
  includes?: {
    [key: string]: string[]
  }
}

export default function normalizeConfig(config: PacyCoreConfig, baseDir?: string): NormalizedPacyCoreConfig {
  config = cloneDeep(
    Object.assign(
      {
        includes: {
          [__SINGLE_ENTRY_KEY]: 'src/pages'
        }
      },
      config
    )
  )

  checkConfig(config)

  if (config.includes) {
    if (isPlainObj(config.includes)) {
      Object.keys(config.includes).forEach((name) => {
        config.includes[name] = toArray(config.includes[name])
      })
    } else {
      config.includes = {
        [__SINGLE_ENTRY_KEY]: toArray(config.includes)
      }
    }

    Object.keys(config.includes)
      .concat(Object.getOwnPropertySymbols(config.includes) as any[])
      .forEach((name) => {
        config.includes[name] = toArray(config.includes[name]).map((name) => {
          if (baseDir) {
            return nps.resolve(baseDir, name)
          }
          return name
        })
      })
  }

  return config as NormalizedPacyCoreConfig
}
