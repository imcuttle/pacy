/**
 * routes webpack plugin
 * @author 余聪
 */
import { FSWatcher, watch } from 'chokidar'
import globby from 'globby'
import { promisify } from 'util'

import HotEmitPlugin from './HotEmitPlugin'

type Options = {
  inputFilename: string
  dirPatterns: string[]
  watchPatterns: string[]
  loaderPath?: string
  loaderOptions?: any
  globbyOptions?: Parameters<typeof globby>[1]
  onTransformData?: (info: any) => Promise<any> | any
}

export default class WatchDirsHotEmitPlugin extends HotEmitPlugin {
  public watcher: FSWatcher
  public data: any
  constructor({
    inputFilename,
    globbyOptions,
    onTransformData,
    loaderPath,
    loaderOptions,
    dirPatterns,
    watchPatterns
  }: Options) {
    const _generateData = async () => {
      const { options } = (this.compilation || {}) as any
      const data = await globby(dirPatterns, {
        cwd: options?.context,
        ...globbyOptions
      })
      if (onTransformData) {
        return await onTransformData(data)
      }
      return data
    }

    const handleData = async () => {
      this.data = await _generateData()
      return this.data
    }

    super(inputFilename, {
      onWatchRun: () => {
        this.watcher = watch(watchPatterns, {
          persistent: true,
          ignoreInitial: true
        })

        const handleDataUpdate = async (_changedFilename) => {
          await handleData()
          await this.emitModule()
          if (this.compilation && this.compilation.inputFileSystem && this.compilation.inputFileSystem.fileSystem) {
            const fs = this.compilation.inputFileSystem.fileSystem
            const stat = await promisify(fs.stat.bind(fs))(this.inputFilename)
            await promisify(fs.utimes.bind(fs))(this.inputFilename, stat.atime, Date.now())
          }
        }
        this.watcher.on('add', handleDataUpdate)
        this.watcher.on('unlink', handleDataUpdate)
      },
      onWatchClose: () => {
        this.watcher.close()
        this.watcher = null
      },
      onModule: async (module) => {
        if (!module) {
          return
        }
        if (!this.data) {
          await handleData()
        }
        const ident = loaderPath || __dirname + '/loader'
        const loader = module.loaders.find((load) => load.ident === ident)
        if (loader) {
          loader.options.data = this.data
          return module
        }

        module.loaders.push({
          loader: ident,
          options: {
            ...loaderOptions,
            data: this.data
          },
          ident: ident
        })

        return module
      }
    })
  }
}
