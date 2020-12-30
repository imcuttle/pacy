const nps = require('path')

const appRoot = (exports.appRoot = nps.resolve(__dirname, '../..'))
const appPackages = (exports.appPackages = nps.resolve(appRoot, 'packages'))

exports.resolveRoot = (...args) => {
  return nps.resolve(appRoot, ...args)
}

exports.resolvePackage = (...args) => {
  return nps.resolve(appPackages, ...args)
}
