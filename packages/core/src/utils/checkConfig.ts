import ow from 'ow'
import PacyCore from '../'

export type TPacyPlugin = ((pacy: PacyCore) => void) | string | [string, any]
export type PacyCoreConfig = {
  // 是否自动读取配置文件
  pacyrc?: boolean
  baseDir?: string

  plugins?: TPacyPlugin[]

  // includes?:
  //   | string
  //   | string[]
  //   | {
  //       [key: string]: string[] | string
  //     }
  // autoRoute

  isDev?: boolean
}

export default function checkConfig(config: PacyCoreConfig) {
  // console.log('config', config)
  return ow(
    config,
    'PacyConfig',
    ow.object.exactShape({
      isDev: ow.optional.boolean,
      plugins: ow.optional.array.ofType(
        ow.any(
          ow.string,
          ow.array.is((array) => typeof array[0] === 'string'),
          ow.function
        )
      ),
      pacyrc: ow.optional.boolean,
      baseDir: ow.optional.string
      // includes: ow.optional.any(
      //   ow.string,
      //   ow.array.ofType(ow.string),
      //   ow.object.valuesOfType(ow.any(ow.string, ow.array.ofType(ow.string)))
      // )
    })
  )
}
