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
import { PacyCoreConfig } from './utils/checkConfig'

export const rcExplorer = cosmiconfig('pacy')

class PacyCore {
  public hooks = {
    accelerate: new SyncHook(['newSpeed']),
    brake: new SyncHook(),
    // @ts-ignore
    calculateRoutes: new AsyncParallelHook(['source', 'target', 'routesList'])
  }
  constructor(public config: PacyCoreConfig = {}) {
    this.config = Object.assign(
      {
        cwd: process.cwd()
      },
      config
    )
  }

  async loadRcConfig(cwd = this.config.cwd) {
    const result = await rcExplorer.search(cwd)
    if (!result) {
      return
    }
    const { config, filepath, isEmpty } = result
    const baseDir = nps.dirname(filepath)

    return config
  }

  async run() {
    const rcConfig = await this.loadRcConfig()
    console.log(rcConfig)
  }
}

export default PacyCore
