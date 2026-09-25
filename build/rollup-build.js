/**
 * 不依赖 gulp 的构建脚本（gulp 3 无法在 Node 12+ 上运行）
 * 用法：npm run build:rollup
 */
var rollup = require('rollup')
var rollupConfig = require('./rollup.config')

Object.keys(rollupConfig).reduce(function (chain, key) {
  return chain.then(function () {
    return rollup.rollup(rollupConfig[key]).then(function (bundle) {
      return bundle.write(rollupConfig[key].output)
    }).then(function () {
      console.log('build ' + rollupConfig[key].output.file)
    })
  })
}, Promise.resolve()).catch(function (err) {
  console.error(err)
  process.exit(1)
})
