import ow from 'ow'

export type PacyCoreConfig = {
  // 是否自动读取配置文件
  pacyrc?: boolean
  cwd?: string
  // autoRoute

  includes?:
    | string
    | string[]
    | {
        [key: string]: string[] | string
      }
}

export default function checkConfig(config: PacyCoreConfig) {
  return ow(
    config,
    'pacy config',
    ow.object.exactShape({
      pacyrc: ow.optional.boolean,
      cwd: ow.optional.string,
      includes: ow.optional.any(
        ow.string,
        ow.array.ofType(ow.string),
        ow.object.valuesOfType(ow.any(ow.string, ow.array.ofType(ow.string)))
      )
    })
  )
}
