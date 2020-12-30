const HtmlWebpackPlugin = require('html-webpack-plugin')
const AutoRoutingPlugin = require('.')

const config = {
  context: __dirname + '/example',
  entry: './src/',
  mode: 'development',
  devtool: 'cheap-source-map',
  plugins: []
}

config.plugins.push(
  new HtmlWebpackPlugin({
    filename: 'index.html'
  }),
  new AutoRoutingPlugin()
)
config.devServer = {
  port: 18080
}

module.exports = config
