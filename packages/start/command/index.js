/**
 * @see https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
 */
exports.command = 'start'
// exports.command = "start <pkg> [globs..]";

exports.describe = 'Start'

exports.builder = (yargs) => {
  yargs
    // .positional("pkg", {
    //   describe: "Package name to add as a dependency",
    //   type: "string",
    // })
    // .positional("globs", {
    //   describe: "Optional package directory globs to match",
    //   type: "array",
    // })
    // .options({})
    .example('$0 start')

  return yargs
}

exports.handler = function handler(argv = {}) {
  return require('..').default({})
}
