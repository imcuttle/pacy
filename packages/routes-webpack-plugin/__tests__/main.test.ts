import * as nps from 'path'
import routesWebpackPlugin from '../src'

const compile = require('./compiler')

const evalCode = (stats: any, filename = 'bundle.js') => {
  const fs = stats.compilation.compiler.outputFileSystem
  const content = fs.readFileSync(nps.resolve(__dirname, filename)).toString()

  const mod = {
    exports: {}
  }
  // console.log('content', content)
  new Function('module', 'exports', 'require', content)(mod, mod.exports, (id) => {
    if (fs.existsSync(nps.resolve(__dirname, id))) {
      return evalCode(stats, id)
    }
    return require(id)
  })
  return mod.exports['__esModule'] ? mod.exports['default'] : mod.exports
}

describe('routesWebpackPlugin', function () {
  it('spec case', async function () {
    const stats = await compile('a.js')
    const x = evalCode(stats)
    console.log(x, stats.toJson())
    // console.log(output)
  })
})
