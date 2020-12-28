/**
 * sass
 * @author imcuttle
 */

const NAME = 'pluginSass'

module.exports = function pluginSass(api) {
  api.hooks.compileRunner.tapPromise(NAME, (compileRunner) => {
    compileRunner.hooks.getWebpackChain.tapPromise(NAME, (chain, webpack) => {
      console.log(chain)
      return chain
    })
  })
}
