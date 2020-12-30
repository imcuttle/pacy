const { AsyncSeriesWaterfallHook, AsyncParallelBailHook, SyncBailHook } = require('tapable')

const pluginHooksMap = new WeakMap()

function createWebpackPluginHooks() {
  return {
    shouldWatch: new AsyncSeriesWaterfallHook(['shouldWatch', 'pluginApi']),
    onWatcher: new AsyncParallelBailHook(['watcher', 'pluginApi']),
    onWatcherClose: new SyncBailHook(['watcher', 'pluginApi']),
    transformData: new AsyncSeriesWaterfallHook(['data', 'pluginApi'])
  }
}

export function getHooks(target) {
  let hooks = pluginHooksMap.get(target)
  // Setup the hooks only once
  if (hooks === undefined) {
    hooks = createWebpackPluginHooks()
    pluginHooksMap.set(target, hooks)
  }
  return hooks
}
