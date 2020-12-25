const HtmlWebpackPlugin = require('html-webpack-plugin')
const createCompiler = require('./__tests__/compiler')

const config = createCompiler('a.js', {
  returnConfig: true,
  toSourceString: require(__dirname + '/example-loader.js')
})

config.plugins.push(
  new HtmlWebpackPlugin({
    filename: 'index.html'
  })
)
config.devServer = {
  port: 18080
}

module.exports = config
