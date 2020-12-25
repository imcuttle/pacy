# @pacy/routes-webpack-plugin

[![NPM version](https://img.shields.io/npm/v/@pacy/routes-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@pacy/routes-webpack-plugin)
[![NPM Downloads](https://img.shields.io/npm/dm/@pacy/routes-webpack-plugin.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/@pacy/routes-webpack-plugin)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)

> routes webpack plugin

## Installation

```bash
npm install @pacy/routes-webpack-plugin
# or use yarn
yarn add @pacy/routes-webpack-plugin
```

## Usage

- webpack config

```javascript
import * as nps from 'path'
import RoutesWebpackPlugin from '@pacy/routes-webpack-plugin'

module.exports = {
  plugins: [
    new RoutesWebpackPlugin({
      // 用来占位的文件
      inputFilename: '/path/to/routes-placeholder',
      // 被解析生成目录结构树的文件目录
      dirPatterns: ['/path/to/src/pages'],
      // 被观察的文件目录
      watchPatterns: ['/path/to/src/pages'],
      // 写成什么样子
      toSourceString: async (data) => {
        return `
module.exports = [
  ${data.map(
    (filename) => `{
  name: ${JSON.stringify(nps.relative(nps.dirname('/path/to/routes-placeholder'), filename))},
  source: () => import(${JSON.stringify(filename)}),
}`
  )}
];
`
      }
    })
  ]
}
```

## Contributing

- Fork it!
- Create your new branch:  
  `git checkout -b feature-new` or `git checkout -b fix-which-bug`
- Start your magic work now
- Make sure npm test passes
- Commit your changes:  
  `git commit -am 'feat: some description (close #123)'` or `git commit -am 'fix: some description (fix #123)'`
- Push to the branch: `git push`
- Submit a pull request :)

## Authors

This library is written and maintained by [余聪](mailto:yucong06@meituan.com).

## License

MIT - [余聪](mailto:yucong06@meituan.com)
