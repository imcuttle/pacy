import * as nps from 'path'
import webpack, { Compiler } from 'webpack'
import { getWebpackChain } from '@pacy/webpack-config'
import Config from 'webpack-chain'
import { promisify } from 'util'
import {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook
} from 'tapable'

import { NormalizedPacyCoreConfig } from '../utils/normalizeConfig'

export default class CompileRunner {
  public hooks = {
    // @ts-ignore
    getWebpackChain: new AsyncSeriesWaterfallHook(['chain', 'webpack']),
    // @ts-ignore
    getWebpackConfig: new AsyncSeriesWaterfallHook(['webpackConfig', 'webpack']),
    getConfig: new AsyncSeriesWaterfallHook(['config'])
  }

  public webpackCompiler: Compiler

  constructor(public config: NormalizedPacyCoreConfig = {}) {
    this.config = config
  }

  async prepare(isBuild = false) {
    const { isDev } = this.config
    const chain = (await this.hooks.getWebpackChain.promise(
      getWebpackChain({ isDev, isBuild }),
      // @ts-ignore
      webpack
    )) as Config
    // @ts-ignore
    const webpackConfig = await this.hooks.getWebpackConfig.promise(chain.toConfig(), webpack)
    this.webpackCompiler = webpack(webpackConfig)
    return this.webpackCompiler
  }

  async build() {
    await this.prepare(true)
    return promisify(this.webpackCompiler.run.bind(this.webpackCompiler))()
  }
}
