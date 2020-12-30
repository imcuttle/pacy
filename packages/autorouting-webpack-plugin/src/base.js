/**
 * auto routing
 * @author imcuttle
 */
const nps = require('path')
const fsExtra = require('fs-extra')
const { safeLoad } = require('js-yaml')
const createTemplate = require('lodash.template')
const RoutesWebpackPlugin = require('@pacy/routes-webpack-plugin').default

const NAME = 'AutoRoutingWebpackPlugin'

module.exports = class AutoRoutingWebpackPlugin {
  constructor(config) {
    this.config = Object.assign(
      {
        writeDirectory: '.pacy',
        pageDirectory: 'pages',
        templateParams: {},
        imports: [],
        dependencies: [],
        force: false,
        silent: false,
        templateIndexFile: nps.join(__dirname, 'template/index.js.ejs'),
        templateEntryFile: nps.join(__dirname, 'template/entry.js.ejs'),
        getRoutesPluginConfig: (config) => config
      },
      config
    )

    this.templateIndex = createTemplate(fsExtra.readFileSync(this.config.templateIndexFile, 'utf-8'))
    this.templateEntry = createTemplate(fsExtra.readFileSync(this.config.templateEntryFile, 'utf-8'))
  }

  get templateParams() {
    return {
      ...this.config.templateParams,
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
    return (type, value) => {
      switch (type) {
        case 'lib': {
          return JSON.stringify(nps.join(__dirname, '../libs', value))
        }
        case 'entry': {
          return JSON.stringify(this.getWriteEntryFile(name))
        }
        case 'routes': {
          return JSON.stringify(this.getWriteRoutesFile(name))
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
        name,
        entry: entryObj,
        context,
        entries: entry,
        source: this.createSourceFn(name, imports)
      }

      const entryFile = this.getWriteEntryFile(name)
      fsExtra.ensureFileSync(entryFile)
      fsExtra.writeFileSync(entryFile, this.templateEntry(params))

      const indexFile = this.getWriteIndexFile(name)
      fsExtra.ensureFileSync(indexFile)
      fsExtra.writeFileSync(indexFile, this.templateIndex(params))

      const dirs = imports.map((imp) => nps.resolve(imp, this.config.pageDirectory))
      new RoutesWebpackPlugin({
        ...this.config.getRoutesPluginConfig(
          {
            inputFilename: this.getWriteRoutesFile(name),
            watchPatterns: dirs.map((dir) => dir + '/*/**/index.*'),
            dirPatterns: dirs.map((dir) => dir + '/*/**/index.*')
          },
          params
        ),
        onTransformData: (files) => {
          const routes = files.map((toFile) => {
            const sourceDir = dirs.find((dir) => toFile.startsWith(dir))
            let meta = {}
            if (/^\s*\/\*(.*?)\*\//gms.test(fsExtra.readFileSync(toFile, 'utf8'))) {
              const content = RegExp.$1
                .split('\n')
                .map((string) => string.replace(/^\s*\*/, ''))
                .join('\n')
              meta = safeLoad(content)
            }

            const name = nps.dirname(nps.relative(sourceDir, toFile))

            return {
              filename: toFile,
              name,
              path: '/' + name,
              meta
            }
          })
          console.log('routes', routes)
          return routes
        }
      }).apply(compiler)

      entry[name].import = [indexFile]
    }
  }
}
