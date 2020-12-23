/**
 * webpack config
 * @author 余聪
 */
import * as webpack from 'webpack'
import Config from 'webpack-chain'
import { Configuration } from 'webpack'

type IWebpackConfigOptions = {
  isDev?: boolean
  isBuild?: boolean
}

export function getWebpackChain({ isDev, isBuild = !isDev }: IWebpackConfigOptions = {}) {
  const config = new Config()

  return config.bail(!!isBuild).mode(isDev ? 'development' : 'production')
}

export default function getWebpackConfig(configOptions: IWebpackConfigOptions): Configuration {
  return getWebpackChain(configOptions).toConfig()
}
