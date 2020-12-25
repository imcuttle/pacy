import x from './_routesPlaceholder'

console.log(
  '_routesPlaceholder',
  x.map(({ name, source }) => ({
    name,
    source: source()
  }))
)
