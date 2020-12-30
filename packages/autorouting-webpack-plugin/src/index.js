/**
 * auto routing
 * @author imcuttle
 */
const nps = require('path')
const RoutesWebpackPlugin = require('@pacy/routes-webpack-plugin').default
const getRoutesHooks = require('@pacy/routes-webpack-plugin').getHooks

const NAME = 'AutoRoutingWebpackPlugin'

module.exports = class AutoRoutingWebpackPlugin {
  constructor(config) {
    this.config = Object.assign(
      {
        writeDirectory: '.pacy',
        pageDirectory: 'src/pages'
      },
      config
    )
  }

  apply(compiler) {
    compiler.hooks.initialize.tap(NAME, () => {
      console.log(compiler.options, compiler.config)
    })
    new RoutesWebpackPlugin({
      inputFilename: nps.resolve(__dirname, '../routes/index.js')
    }).apply(compiler)
  }
}
