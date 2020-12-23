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
import defineSymbolic from 'symbolic-link'

import { PacyCoreConfig } from './utils/checkConfig'
import normalizeConfig, { NormalizedPacyCoreConfig } from './utils/normalizeConfig'
import CompileRunner from './compile-runner'

export const rcExplorer = cosmiconfig('pacy')

class PacyCore {
  public hooks = {
    getConfig: new AsyncSeriesWaterfallHook(['config']),
    compileRunner: new AsyncSeriesBailHook(['compileRunner'])
  }

  public compileRunner: CompileRunner = new CompileRunner()
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
      return this.hooks.getConfig.promise(Object.assign({}, this._config, rcConfig))
    }
    return this.hooks.getConfig.promise({ ...this._config })
  }

  async getCompileRunner() {
    this.config = await this.getConfig()
    defineSymbolic(this.compileRunner, {
      config: [this, 'config']
    })
    await this.hooks.compileRunner.promise(this.compileRunner)

    return this.compileRunner
  }
}

export default PacyCore
