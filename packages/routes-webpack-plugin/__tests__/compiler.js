const path = require('path')
const webpack = require('webpack')
const RoutesWebpackPlugin = require('../' + (process.env.NODE_ENV === 'test' ? 'src' : 'lib')).default
const Memoryfs = require('memory-fs')
// const { RawSource } = require('webpack-sources')

const h = require('./helper')

module.exports = (fixture, options = {}) => {
  const config = {
    context: __dirname,
    entry: `./fixture/${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js'
    },
    mode: 'development',
    module: {
      rules: [
        {
          // test: /\.js$/,
          // loader: [
          //   // 'raw'
          // ]
        }
      ]
    },
    devtool: 'source-map',
    resolve: {},
    plugins: [
      new RoutesWebpackPlugin({
        inputFilename: h.fixture('_routesPlaceholder.js'),
        dirPatterns: ['fixture/pages'],
        watchPatterns: [h.fixture('pages')],
        toSourceString: options.toSourceString,
        globbyOptions: {}
      })
    ]
  }

  if (options.returnConfig) {
    return config
  }
  const compiler = webpack(config)
  compiler.outputFileSystem = new Memoryfs()

  if (options.watch) {
    return compiler.watch({}, options.callback)
  }

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) reject(err || stats.compilation.errors[0])

      resolve(stats)
    })
  })
}
