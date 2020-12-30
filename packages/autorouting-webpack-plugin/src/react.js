const nps = require('path')
const AutoRoutingWebpackPlugin = require('./base')

module.exports = class ReactAutoRoutingWebpackPlugin extends AutoRoutingWebpackPlugin {
  constructor(config = {}) {
    super({
      templateIndexFile: nps.join(__dirname, 'react-template/index.js.ejs'),
      templateEntryFile: nps.join(__dirname, 'react-template/entry.js.ejs'),
      ...config,
      getRoutesPluginConfig: (defaultConfig) => {
        const myConfig = {
          toSourceString: (data) => {
            const importSource = `${data
              .map(({ filename, path, meta, name }, index) => {
                return `import Page${index} from ${JSON.stringify(
                  'react-webpack-lazyloader!' + filename + '?chunkName=pacy-' + name
                )}`
              })
              .join('\n')}`

            return `${importSource}\nexport default [${data
              .map(({ filename, path, meta }, index) => {
                return `{
    component: Page${index},
    path: ${JSON.stringify(path)},
    meta: ${JSON.stringify(meta)},
  }`
              })
              .join(',')}];`
          }
        }
        if (config.getRoutesPluginConfig) {
          return config.getRoutesPluginConfig({ ...defaultConfig, ...myConfig })
        }

        return {
          ...defaultConfig,
          ...myConfig
        }
      },
      templateParams: {
        reactElementSelector: '#root',
        ...config.templateParams
      }
    })
  }
}
