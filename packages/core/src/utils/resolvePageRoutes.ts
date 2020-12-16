import globby from 'globby'
import * as nps from 'path'

import { NormalizedPacyCoreConfig } from './normalizeConfig'
import toArray from './toArray'

export default async function resolvePageRoutes(includes: NormalizedPacyCoreConfig['includes']) {
  const routes = {}

  const promList = Object.keys(includes).map(async (name) => {
    const dirs = toArray(includes[name])

    const routesEntry = await dirs.reduce(async (p, dir) => {
      const acc = await p
      const names = await globby('**', {
        cwd: dir,
        onlyDirectories: true,
        absolute: false
      })

      const maps = names.reduce((acc, name) => {
        acc[name] = nps.join(dir, name)
        return acc
      }, {})

      return { ...acc, ...maps }
    }, Promise.resolve({}))

    routes[name] = routesEntry
  })

  await Promise.all(promList)
  return routes
}
