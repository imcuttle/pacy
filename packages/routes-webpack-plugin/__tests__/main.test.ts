import routesWebpackPlugin from '../src'

const compile = require('./compiler')

describe('routesWebpackPlugin', function () {
  it('spec case', async function () {
    const data = await compile('a.js')
    console.log(data)
  })
})
