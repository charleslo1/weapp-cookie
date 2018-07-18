var resolve = require('rollup-plugin-node-resolve')
var commonjs = require('rollup-plugin-commonjs')
var babel = require('rollup-plugin-babel')

var baseConfig = {
  input: 'index.js',
  output: {
    file: 'dist/weapp-cookie.js',
    name: 'weappCookie',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ]
}

module.exports = {
  // 入口
  index: Object.assign({}, baseConfig)
}
