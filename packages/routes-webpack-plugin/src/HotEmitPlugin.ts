import { promisify } from 'util'
const NAME = 'HotEmitPlugin'

type SyncOrAsync<T> = T | Promise<T>

export type HotEmitPluginOptions = {
  onModule: (oldAsset?: any) => SyncOrAsync<any>
  onWatchRun?: (compiler: any, pluginApi: HotEmitPlugin) => SyncOrAsync<void>
  onWatchClose?: (compiler: any, pluginApi: HotEmitPlugin) => void
}

export default class HotEmitPlugin {
  public compilation: any
  public compiler: any

  constructor(public inputFilename: string, public options: HotEmitPluginOptions) {
    this.options = options
    this.inputFilename = inputFilename

    this.compilation = null
  }

  async emitModule() {
    if (!this.compilation || !this.options.onModule) {
      return
    }
    const compilation = this.compilation as any

    let oldModule
    for (const mod of compilation.modules) {
      if (mod.resource === this.inputFilename) {
        oldModule = mod
        break
      }
    }

    const newModule = await this.options.onModule(oldModule)
    if (!newModule) {
      return
    }

    if (oldModule) {
      // compilation.buildModule()
      return promisify(compilation.rebuildModule.bind(compilation))(newModule)
    }
    return compilation.addModule(newModule)
  }

  apply(compiler) {
    this.compiler = compiler
    compiler.hooks.watchRun.tapPromise(NAME, async (compiler) => {
      this.options.onWatchRun && (await this.options.onWatchRun(compiler, this))
    })
    compiler.hooks.watchClose.tap(NAME, (compiler) => {
      this.options.onWatchClose && this.options.onWatchClose(compiler, this)
    })

    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      compilation.hooks.buildModule.tap(NAME, async (module) => {
        if (module.resource === this.inputFilename) {
          this.compilation = compilation
          await this.emitModule()
        }
      })
    })
  }
}
