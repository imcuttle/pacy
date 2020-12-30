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

import defaultPlugin from './plugins'
import { PacyCoreConfig, TPacyPlugin } from './utils/checkConfig'
import normalizeConfig, { NormalizedPacyCoreConfig } from './utils/normalizeConfig'
import CompileRunner from './compile-runner'

const requireModule = (id) => {
  let mod = require(id)
  if (mod.__esModule) {
    return mod.default
  }
  return mod
}

export * from './utils/checkConfig'

export const rcExplorer = cosmiconfig('pacy')

class PacyCore {
  public hooks = {
    getConfig: new AsyncSeriesWaterfallHook(['config']),
    compileRunner: new AsyncParallelHook(['compileRunner'])
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

    this.applyPlugin(defaultPlugin())
  }

  applyPlugin(plugin?: TPacyPlugin) {
    if (!plugin) {
      return
    }
    if (typeof plugin === 'string') {
      requireModule(plugin)()(this)
    } else if (Array.isArray(plugin)) {
      requireModule(plugin[0])(plugin[1])(this)
    } else if (typeof plugin === 'function') {
      plugin(this)
    }
  }

  applyPlugins(plugins: TPacyPlugin[] = []) {
    if (!plugins) {
      return
    }
    plugins.forEach((plg) => this.applyPlugin(plg))
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
      this.applyPlugins(rcConfig.plugins)
      return Object.assign({}, rcConfig, this._config)
    }
    return { ...this._config }
  }

  async getCompileRunner() {
    const config = await this.getConfig()
    this.applyPlugins(config.plugins)

    this.config = await this.hooks.getConfig.promise(config)
    defineSymbolic(this.compileRunner, {
      config: [this, 'config']
    })
    await this.hooks.compileRunner.promise(this.compileRunner)

    return this.compileRunner
  }
}

export default PacyCore
