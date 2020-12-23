import ow from 'ow'

export type PacyCoreConfig = {
  // 是否自动读取配置文件
  pacyrc?: boolean
  baseDir?: string

  includes?:
    | string
    | string[]
    | {
        [key: string]: string[] | string
      }
  // autoRoute

  isDev?: boolean
}

export default function checkConfig(config: PacyCoreConfig) {
  return ow(
    config,
    'pacy config',
    ow.object.exactShape({
      pacyrc: ow.optional.boolean,
      baseDir: ow.optional.string,
      includes: ow.optional.any(
        ow.string,
        ow.array.ofType(ow.string),
        ow.object.valuesOfType(ow.any(ow.string, ow.array.ofType(ow.string)))
      )
    })
  )
}
