/**
 * cli use
 * @author 余聪
 */

import cli from '@pacy/cli'
import PacyCore from '@pacy/core'
import { PacyCoreConfig, rcExplorer } from '@pacy/core'

// const addCmd = require('@lerna/add/command')
// const bootstrapCmd = require('@lerna/bootstrap/command')
// const changedCmd = require('@lerna/changed/command')
// const cleanCmd = require('@lerna/clean/command')
// const createCmd = require('@lerna/create/command')
// const diffCmd = require('@lerna/diff/command')
// const execCmd = require('@lerna/exec/command')
// const importCmd = require('@lerna/import/command')
// const infoCmd = require('@lerna/info/command')
// const initCmd = require('@lerna/init/command')
// const linkCmd = require('@lerna/link/command')
// const listCmd = require('@lerna/list/command')
// const publishCmd = require('@lerna/publish/command')
// const runCmd = require('@lerna/run/command')
// const versionCmd = require('@lerna/version/command')

const nps = require('path')

const pkg = require('../package.json')

type RcConfig = PacyCoreConfig & {
  extendCommands: string[]
}

export default async function pacyCli(argv) {
  const context = {
    pacyVersion: pkg.version
  }

  const result = await rcExplorer.search(process.cwd())
  let baseDir = ''
  let commands = []

  if (result) {
    const { config, filepath, isEmpty } = result
    baseDir = nps.dirname(filepath)
    commands = config.extendCommands || []
  }

  let cliInstance = cli()

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
