/**
 * webpack config
 * @author 余聪
 */
import * as webpack from 'webpack'
import * as Config from 'webpack-chain'
import { Configuration } from 'webpack'

type IWebpackConfigOptions = {
  isDev?: boolean
  isBuild?: boolean
}

export function webpackChain({ isDev, isBuild = !isDev }: IWebpackConfigOptions = {}) {
  const config = new Config()

  return config.bail(!!isBuild).mode(isDev ? 'development' : 'production')
}

export default function webpackConfig(configOptions: IWebpackConfigOptions): Configuration {
  return webpackChain(configOptions).toConfig()
}
