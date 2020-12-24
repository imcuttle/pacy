/**
 * core
 * @author 余聪
 */
import * as nps from 'path'
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
import { cosmiconfig } from 'cosmiconfig'
import { defineSymbolic } from 'symbolic-link'

import { PacyCoreConfig, TPacyPlugin } from './utils/checkConfig'
import normalizeConfig, { NormalizedPacyCoreConfig } from './utils/normalizeConfig'
import CompileRunner from './compile-runner'

export * from './utils/checkConfig'

export const rcExplorer = cosmiconfig('pacy')

class PacyCore {
  public hooks = {
    getConfig: new AsyncSeriesWaterfallHook(['config']),
    compileRunner: new AsyncSeriesBailHook(['compileRunner'])
  }

  public compileRunner: CompileRunner = new CompileRunner()
  // private _plugins: PacyPlugin[]

  private _config: NormalizedPacyCoreConfig
  public config: NormalizedPacyCoreConfig = {}

  constructor(config: PacyCoreConfig = {}) {
    this._config = Object.assign(
      {
        baseDir: process.cwd()
      },
      normalizeConfig(config)
    )
  }

  runPlugin(plugin?: TPacyPlugin) {
    if (!plugin) {
      return
    }
    if (typeof plugin === 'string') {
      require(plugin)()(this)
    } else if (Array.isArray(plugin)) {
      require(plugin[0])(plugin[1])(this)
    } else if (typeof plugin === 'function') {
      plugin(this)
    }
  }

  runPlugins(plugins: TPacyPlugin[] = []) {
    plugins.forEach((plg) => this.runPlugin(plg))
  }

  async loadRcConfig(cwd = this._config.baseDir) {
    const result = await rcExplorer.search(cwd)
    if (!result) {
      return
    }
    const { config, filepath, isEmpty } = result
    const baseDir = nps.dirname(filepath)
    return normalizeConfig(config, baseDir)
  }

  async getConfig() {
    if (this._config.pacyrc) {
      const rcConfig = await this.loadRcConfig()
      this.runPlugins(rcConfig.plugins)
      return Object.assign({}, rcConfig, this._config)
    }
    return { ...this._config }
  }

  async getCompileRunner() {
    const config = await this.getConfig()
    this.runPlugins(config.plugins)

    this.config = await this.hooks.getConfig.promise(config)
    defineSymbolic(this.compileRunner, {
      config: [this, 'config']
    })
    await this.hooks.compileRunner.promise(this.compileRunner)

    return this.compileRunner
  }
}

export default PacyCore
