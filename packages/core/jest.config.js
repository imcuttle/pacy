module.exports = {
  ...require('../../jest.config'),
  name: require('./package.json').name,
  displayName: require('./package').name,
  testMatch: [`${__dirname}/__tests__/**/*.{spec,test}.ts{x,}`],
  rootDir: '../..'
}
