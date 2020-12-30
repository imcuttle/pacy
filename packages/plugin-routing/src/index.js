/**
 * auto routing
 * @author imcuttle
 */
const NAME = 'pluginRouting'

module.exports = function pluginRouting() {
  return (api) => {
    api.hooks.compileRunner.tap(NAME, (compileRunner) => {
      compileRunner.hooks.getWebpackChain.tap(NAME, (chain, webpack) => {
        console.log(chain, compileRunner.config)

        // chain.
        // chain.
        return chain
      })
    })
  }
}
