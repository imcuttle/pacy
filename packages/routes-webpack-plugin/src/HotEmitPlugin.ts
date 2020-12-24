const NAME = 'HotEmitPlugin'

type SyncOrAsync<T> = T | Promise<T>

export type Asset = { source?: any; info?: any }

export type HotEmitPluginOptions = {
  onAsset: (oldAsset?: Asset) => SyncOrAsync<Asset>
  onWatchRun?: (compiler: any, pluginApi: HotEmitPlugin) => SyncOrAsync<void>
  onWatchClose?: (compiler: any, pluginApi: HotEmitPlugin) => void
}

export default class HotEmitPlugin {
  private compilation: null

  constructor(public inputFilename: string, public options: HotEmitPluginOptions) {
    this.options = options
    this.inputFilename = inputFilename

    this.compilation = null
  }

  async emitAsset() {
    if (!this.compilation || !this.options.onAsset) {
      return
    }
    const compilation = this.compilation as any
    // console.log(compilation.assets)
    const oldAsset = compilation.assets[this.inputFilename]
    const { source, info } = await this.options.onAsset(oldAsset)

    console.log({ source, info })
    if (oldAsset) {
      return compilation.updateAsset(this.inputFilename, source, info)
    }
    return compilation.emitAsset(this.inputFilename, source, info)
  }

  apply(compiler) {
    compiler.hooks.watchRun.tapPromise(NAME, async (compiler) => {
      this.options.onWatchRun && (await this.options.onWatchRun(compiler, this))
    })
    compiler.hooks.watchClose.tap(NAME, (compiler) => {
      this.options.onWatchClose && this.options.onWatchClose(compiler, this)
    })

    // Executed right before emitting assets to output dir.
    compiler.hooks.afterEmit.tapPromise(NAME, async (compilation) => {
      this.compilation = compilation
      return this.emitAsset()
    })
  }
}
