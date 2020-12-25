module.exports = [
  {
    name: './pages/a.js',
    source: function () {
      return import('/Users/yucong06/code/pacy/packages/routes-webpack-plugin/__tests__/fixture/pages/a.js')
    }
  },
  {
    name: './pages/b.js',
    source: function () {
      return import('/Users/yucong06/code/pacy/packages/routes-webpack-plugin/__tests__/fixture/pages/b.js')
    }
  },
  {
    name: './pages/c.js',
    source: function () {
      return import('/Users/yucong06/code/pacy/packages/routes-webpack-plugin/__tests__/fixture/pages/c.js')
    }
  },
  {
    name: './pages/d.js',
    source: function () {
      return import('/Users/yucong06/code/pacy/packages/routes-webpack-plugin/__tests__/fixture/pages/d.js')
    }
  }
]
