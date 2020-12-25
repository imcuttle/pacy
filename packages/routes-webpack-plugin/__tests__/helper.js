/**
 * @file helper
 */

const nps = require('path')

function fixture(...args) {
  return nps.join.apply(nps, [__dirname, 'fixture'].concat(...args))
}

module.exports = {
  fixture
}
