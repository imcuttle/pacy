/**
 * routes webpack plugin
 * @author 余聪
 */
import { FSWatcher, watch } from 'chokidar'
import globby from 'globby'
import * as fs from 'fs-extra'
import debounce from 'lodash.debounce'
import { getHooks } from './hooks'

import HotEmitPlugin from './HotEmitPlugin'

type Options = {
  inputFilename: string
  dirPatterns: string[]
  watchPatterns: string[]
  toSourceString?: (data: any) => Promise<string> | string
  globbyOptions?: Parameters<typeof globby>[1]
  onTransformData?: (info: any) => Promise<any> | any
}

export { getHooks }

export default class WatchDirsHotEmitPlugin extends HotEmitPlugin {
  static getHooks = getHooks

  public watcher: FSWatcher
  public data: any
  constructor({
    inputFilename,
    globbyOptions,
    onTransformData,
    toSourceString = (data) => `module.exports = ${JSON.stringify(data)}`,
    dirPatterns,
    watchPatterns
  }: Options) {
    const _generateData = async () => {
      const { options } = (this.compilation || {}) as any
      let data = await globby(dirPatterns, {
        cwd: options?.context,
        absolute: true,
        ...globbyOptions
      })
      // @ts-ignore
      data = await getHooks(this.compiler).transformData.promise(data, this)
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
      onWatchRun: async (compiler) => {
        // @ts-ignore
        if (false === (await getHooks(compiler).shouldWatch.promise(true, this))) {
          return
        }

        this.watcher = watch(watchPatterns, {
          persistent: true,
          ignoreInitial: true
        })

        const handleDataUpdate = debounce(async (_changedFilename) => {
          console.log('_changedFilename', _changedFilename)
          await handleData()
          await this.emitModule()
        }, 120)
        this.watcher.on('add', handleDataUpdate)
        this.watcher.on('unlink', handleDataUpdate)
        // @ts-ignore
        await getHooks(compiler).onWatcher.promise(this.watcher, this)
      },
      onWatchClose: (compiler) => {
        if (!this.watcher) {
          return
        }
        // @ts-ignore
        getHooks(compiler).onWatcherClose.call(this.watcher, this)
        this.watcher.close()
        this.watcher = null
      },
      onModule: async (module) => {
        if (!this.data) {
          await handleData()
        }

        const sourceString = await toSourceString(this.data)
        await fs.writeFile(this.inputFilename, sourceString, 'utf8')
      }
    })
  }
}
