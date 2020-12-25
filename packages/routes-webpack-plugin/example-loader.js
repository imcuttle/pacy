const nps = require('path')
const h = require('./__tests__/helper')

module.exports = function (data) {
  return `
module.exports = [
  ${data.map((filename) => {
    const relativeName = './' + nps.relative(nps.dirname(h.fixture('_routesPlaceholder.js')), filename)
    return `{
  name: ${JSON.stringify(relativeName)},
  source: function () { return import(${JSON.stringify(filename)}) },
}`
  })}
];
`
}
