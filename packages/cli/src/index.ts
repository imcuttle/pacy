/**
 * cli
 * @author 余聪
 */
import yargs from 'yargs/yargs'
import ora from 'ora'

const spinner = ora('@pacy/cli')

export default function cli(argv?: any[], cwd?: string) {
  const cli = yargs(argv, cwd)

  return (
    cli
      .usage('Usage: $0 <command> [options]')
      .demandCommand(1, 'A command is required. Pass --help to see all available commands and options.')
      .recommendCommands()
      // .strict()
      .fail((msg, err) => {
        // certain yargs validations throw strings :P
        const actual = err || (new Error(msg) as any)

        // ValidationErrors are already logged, as are package errors
        if (actual.name !== 'ValidationError' && !actual.pkg) {
          // the recommendCommands() message is too terse
          if (/Did you mean/.test(actual.message)) {
            // @ts-ignore
            spinner.fail(`Unknown command "${cli.parsed.argv._[0]}"`)
          }

          spinner.fail(String(actual.stack))
        }

        // exit non-zero so the CLI can be usefully chained
        // @ts-ignore
        cli.exit(actual.code > 0 ? actual.code : 1, actual)
      })
      .alias('h', 'help')
      .alias('v', 'version')
      .wrap(cli.terminalWidth())
  )
  // .epilogue(dedent`
  //   When a command fails, all logs are written to lerna-debug.log in the current working directory.
  //
  //   For more information, find our manual at https://github.com/lerna/lerna
  // `)
}
