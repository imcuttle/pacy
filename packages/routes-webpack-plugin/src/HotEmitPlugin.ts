import { promisify } from 'util'
const NAME = 'HotEmitPlugin'
import * as fs from 'fs-extra'

type SyncOrAsync<T> = T | Promise<T>

export type HotEmitPluginOptions = {
  onModule: (oldAsset?: any) => SyncOrAsync<any>
  onWatchRun?: (compiler: any, pluginApi: HotEmitPlugin) => SyncOrAsync<void>
  onWatchClose?: (compiler: any, pluginApi: HotEmitPlugin) => void
}

export default class HotEmitPlugin {
  public compilation: any
  public compiler: any
  public initialized = false

  constructor(public inputFilename: string, public options: HotEmitPluginOptions) {
    this.options = options
    this.inputFilename = inputFilename

    this.compilation = null
  }

  async emitModule() {
    const compilation = this.compilation as any

    let oldModule
    for (const mod of compilation?.modules || []) {
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

  async init() {
    if (this.initialized) {
      return
    }
    this.initialized = true
    if (this.inputFilename) {
      fs.ensureFileSync(this.inputFilename)
    }
    await this.emitModule()
  }

  apply(compiler) {
    this.compiler = compiler
    compiler.hooks.watchRun.tapPromise(NAME, async (compiler) => {
      this.options.onWatchRun && (await this.options.onWatchRun(compiler, this))
    })
    compiler.hooks.watchClose.tap(NAME, (compiler) => {
      this.options.onWatchClose && this.options.onWatchClose(compiler, this)
    })

    compiler.hooks.initialize.tap(NAME, async () => {})

    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      this.compilation = compilation
      this.init()
    })
  }
}
