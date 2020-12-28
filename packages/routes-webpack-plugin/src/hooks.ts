import {
  // @ts-ignore
  AsyncSeriesWaterfallHook,
  AsyncParallelBailHook,
  SyncBailHook
} from 'tapable'

const pluginHooksMap = new WeakMap()

function createWebpackPluginHooks() {
  return {
    // @ts-ignore
    shouldWatch: new AsyncSeriesWaterfallHook(['shouldWatch', 'pluginApi']),
    // @ts-ignore
    onWatcher: new AsyncParallelBailHook(['watcher', 'pluginApi']),
    // @ts-ignore
    onWatcherClose: new SyncBailHook(['watcher', 'pluginApi']),
    // @ts-ignore
    transformData: new AsyncSeriesWaterfallHook(['data', 'pluginApi'])
  }
}

export function getHooks(target): ReturnType<typeof createWebpackPluginHooks> {
  let hooks = pluginHooksMap.get(target)
  // Setup the hooks only once
  if (hooks === undefined) {
    hooks = createWebpackPluginHooks()
    pluginHooksMap.set(target, hooks)
  }
  return hooks
}
