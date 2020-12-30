const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ReactAutoRoutingWebpackPlugin } = require('.')

const config = {
  context: __dirname + '/example',
  entry: './src/',
  mode: 'development',
  devtool: 'cheap-source-map',
  plugins: [],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [],
              presets: ['@babel/env', '@babel/react']
            }
          }
        ]
      }
    ]
  }
}

config.plugins.push(
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: __dirname + '/index.html'
  }),
  new ReactAutoRoutingWebpackPlugin()
)
config.devServer = {
  port: 18080
}

module.exports = config
