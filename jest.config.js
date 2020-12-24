const { packagePrefix } = require('./package.json')

module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__test{s,}__/*.(spec|test).{t,j}s{x,}'],
  rootDir: __dirname,
  moduleNameMapper: {
    [`^${packagePrefix}([^\/]+)$`]: '<rootDir>/packages/$1/src'
  }
}
