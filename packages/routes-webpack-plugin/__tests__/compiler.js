const path = require('path')
const webpack = require('webpack')
const RoutesWebpackPlugin = require('../src').default
const Memoryfs = require('memory-fs')

const h = require('./helper')

module.exports = (fixture, options) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./fixture/${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js'
    },
    mode: 'development',
    module: {},
    resolve: {},
    plugins: [
      new RoutesWebpackPlugin({
        inputFilename: h.fixture('_routesPlaceholder.js'),
        dirPatterns: [h.fixture('pages')],
        watchPatterns: [h.fixture('pages')],
        globbyOptions: {
          absolute: false
        },
        onAsset: (data, asset) => {
          console.log(data, asset)
          return {
            source: {
              source: () => 'module.exports = "abc";',
              size: () => 'module.exports = "abc";'.length
            }
            // info: 'info'
          }
        }
      })
    ]
  })
  compiler.outputFileSystem = new Memoryfs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) reject(err || stats.compilation.errors[0])

      resolve(stats)
    })
  })
}
