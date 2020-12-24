/**
 * routes webpack plugin
 * @author 余聪
 */
import { watch, FSWatcher } from 'chokidar'
import globby from 'globby'

import HotEmitPlugin from './HotEmitPlugin'

type onHotEmitAsset = ConstructorParameters<typeof HotEmitPlugin>[1]['onAsset']

type Options = {
  inputFilename: string
  dirPatterns: string[]
  watchPatterns: string[]
  onAsset: (data: any, ...asset: Parameters<onHotEmitAsset>) => ReturnType<onHotEmitAsset>
  globbyOptions?: Parameters<typeof globby>[1]
  onTransformData?: (info: any) => Promise<any> | any
}

export default class WatchDirsHotEmitPlugin extends HotEmitPlugin {
  public watcher: FSWatcher
  public data: any
  constructor({ inputFilename, globbyOptions, onTransformData, onAsset, dirPatterns, watchPatterns }: Options) {
    const _generateData = async () => {
      const data = await globby(dirPatterns, {
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
          persistent: true
        })

        const handleDataUpdate = async () => {
          await this.emitAsset()
        }
        this.watcher.on('add', handleDataUpdate)
        this.watcher.on('unlink', handleDataUpdate)
      },
      onWatchClose: () => {
        this.watcher.close()
        this.watcher = null
      },
      onAsset: async (...args) => {
        if (!this.data) {
          await handleData()
        }
        return onAsset(this.data, ...args)
      }
    })
  }
}
