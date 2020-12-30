/**
 * auto routing
 * @author imcuttle
 */
const nps = require('path')
const fsExtra = require('fs-extra')
const createTemplate = require('lodash.template')
const RoutesWebpackPlugin = require('@pacy/routes-webpack-plugin').default
const getRoutesHooks = require('@pacy/routes-webpack-plugin').getHooks

const NAME = 'AutoRoutingWebpackPlugin'

const templateIndex = createTemplate(fsExtra.readFileSync(nps.join(__dirname, 'template/index.js.ejs'), 'utf-8'))
const templateEntry = createTemplate(fsExtra.readFileSync(nps.join(__dirname, 'template/entry.js.ejs'), 'utf-8'))

module.exports = class AutoRoutingWebpackPlugin {
  constructor(config) {
    this.config = Object.assign(
      {
        writeDirectory: '.pacy',
        pageDirectory: 'pages',
        imports: [],
        dependencies: [],
        force: false,
        silent: false
      },
      config
    )
  }

  get templateParams() {
    return {
      imports: this.config.imports,
      dependencies: this.config.dependencies.map((dep) => {
        if (typeof dep === 'string') {
          return {
            source: dep,
            options: {}
          }
        }
        return dep
      })
    }
  }

  createSourceFn(name, imports) {
    console.log('imports', imports)
    return (type, value) => {
      switch (type) {
        case 'lib': {
          return JSON.stringify(nps.join(__dirname, '../libs', value))
        }
        case 'entry': {
          return JSON.stringify(this.getWriteEntryFile(name))
        }
        case 'rawEntries': {
          return imports || []
        }
        default: {
          throw new Error(`type=${type} is not support!`)
        }
      }
    }
  }

  warnLog(...args) {
    if (this.config.silent) {
      return
    }
    console.error(`[${NAME} warning]:`, ...args)
  }

  get writeDirectory() {
    const { mode = 'production', context } = this.compiler.options
    return nps.resolve(context, this.config.writeDirectory, mode)
  }

  getWriteEntryFile(name) {
    return nps.resolve(this.writeDirectory, name, 'entry.js')
  }

  getWriteIndexFile(name) {
    return nps.resolve(this.writeDirectory, name, 'index.js')
  }

  getWriteRoutesFile(name) {
    return nps.resolve(this.writeDirectory, name, 'routes.js')
  }

  apply(compiler) {
    this.compiler = compiler
    const { library, libraryTarget } = compiler.options.output
    const { target = 'web', entry, context = process.cwd() } = compiler.options
    if ((library || target !== 'web') && !this.config.force) {
      this.warnLog(`target=${target}, library=${library} is skip this, Please pass force=true to enable it`)
      return
    }

    for (const [name, entryObj] of Object.entries(entry)) {
      const imports = entryObj.import.slice().map((x) => nps.resolve(context, x))
      const params = {
        ...this.templateParams,
        context,
        source: this.createSourceFn(name, imports)
      }

      const entryFile = this.getWriteEntryFile(name)
      fsExtra.ensureFileSync(entryFile)
      fsExtra.writeFileSync(entryFile, templateEntry(params))

      const indexFile = this.getWriteIndexFile(name)
      fsExtra.ensureFileSync(indexFile)
      fsExtra.writeFileSync(indexFile, templateIndex(params))

      new RoutesWebpackPlugin({
        inputFilename: this.getWriteRoutesFile(name),
        watchPatterns: imports,
        dirPatterns: imports
      }).apply(compiler)

      entry[name].import = [indexFile]
    }

    console.log({ context, entry: JSON.stringify(entry) })

    compiler.hooks.watchClose.tap(NAME, () => {
      console.log('done')
    })
    // compiler.hooks.initialize.tap(NAME, () => {
    //   // console.log(compiler.options.entry)
    // })
  }
}
