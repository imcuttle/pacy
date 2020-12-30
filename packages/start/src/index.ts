/**
 * start command
 * @author 余聪
 */
import PacyCore, { PacyCoreConfig } from '@pacy/core'
import express from 'express'
import getPort from 'get-port'
import webpack from 'webpack'
import middleware from 'webpack-dev-middleware'

type StartPacyCoreConfig = PacyCoreConfig & {
  port?: number
}

export default async function start({ port = 6060, ...config }: StartPacyCoreConfig = {}) {
  const pacy = new PacyCore({ ...config, isDev: true })
  const compileRunner = await pacy.getCompileRunner()
  const webpackCompiler = await compileRunner.prepare()

  const app = express()
  const instance = middleware(webpackCompiler, {})
  app.use(instance)

  port = await getPort({ port: getPort.makeRange(port, 65535) })
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
