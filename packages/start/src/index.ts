/**
 * start command
 * @author 余聪
 */
import PacyCore, { PacyCoreConfig } from '@pacy/core'
import webpackDevServer from 'webpack-dev-server'

export default async function start(config: PacyCoreConfig = {}) {
  const pacy = new PacyCore({ ...config, isDev: true })
  const compileRunner = await pacy.getCompileRunner()
  const webpackCompiler = await compileRunner.prepare()

  console.log(webpackCompiler)
}
