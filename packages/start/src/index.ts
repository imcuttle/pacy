/**
 * start command
 * @author 余聪
 */
import PacyCore, { PacyCoreConfig } from '@pacy/core'
import express from 'express'
import getPort from 'get-port'
import middleware from 'webpack-dev-middleware'

type StartPacyCoreConfig = PacyCoreConfig & {
  port?: number
}

export default async function start({ port = 6060, ...config }: StartPacyCoreConfig = {}) {
  const pacy = new PacyCore({ ...config, isDev: true })
  const compileRunner = await pacy.getCompileRunner()
  const webpackCompiler = await compileRunner.prepare()

  const app = express()
  app.use(
    middleware(webpackCompiler, {
      // webpack-dev-middleware options
    })
  )

  port = await getPort({ port: getPort.makeRange(port, 65535) })
  app.listen(port, () => console.log('Example app listening on port 3000!'))
}
