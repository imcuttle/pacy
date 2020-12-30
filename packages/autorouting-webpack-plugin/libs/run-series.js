module.exports = function (createTasks) {
  let p = Promise.resolve()
  for (let i = 0; i < createTasks.length; i++) {
    const create = createTasks[i]
    p = p.then((flag) => {
      if (flag !== false) {
        return create()
      }
      return flag
    })
  }

  return p
}
