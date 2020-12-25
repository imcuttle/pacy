const loaderUtils = require('loader-utils')

module.exports = function (_source) {
  const { data } = loaderUtils.getOptions(this) || {}
  return `module.exports = ${JSON.stringify(data)}`
}
