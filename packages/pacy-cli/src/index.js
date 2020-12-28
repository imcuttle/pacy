/**
 * cli use
 * @author 余聪
 */

const cli = require('@pacy/cli').default
const { PacyCoreConfig, rcExplorer } = require('@pacy/core')

const startCmd = require('@pacy/start/command')

const nps = require('path')

const pkg = require('../package.json')

// type RcConfig = PacyCoreConfig & {
//   extendCommands: string[]
// }

module.exports = async function pacyCli(argv) {
  const context = {
    pacyVersion: pkg.version
  }

  const result = await rcExplorer.search(process.cwd())
  let baseDir = ''
  let commands = []

  if (result) {
    const { config, filepath, isEmpty } = result
    baseDir = nps.dirname(filepath)
    commands = config ? config.extendCommands || [] : []
  }

  let cliInstance = cli().command(startCmd)

  commands.forEach((cmd) => {
    // relative path
    if (cmd.startsWith('.')) {
      cmd = nps.resolve(baseDir, cmd)
    }
    if (!cmd.endsWith('/command')) {
      cmd = nps.join(cmd, 'command')
    }
    cliInstance = cliInstance.command(require(cmd))
  })

  return cliInstance.parse(argv, context)
}
