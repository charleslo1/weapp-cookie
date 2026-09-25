const assert = require('assert')

// 源码为 ES Module，需先转译后直接测试，避免只覆盖打包后的 dist
require('babel-register')({
  babelrc: false,
  presets: [['es2015', { modules: 'commonjs' }]],
  plugins: []
})
const util = require('../src/util').default

describe('util.js', () => {

  it('util.stripPort(domain)', () => {
    assert.equal('www.baidu.com.cn', util.stripPort('www.baidu.com.cn:2443'))
    assert.equal('www.baidu.com.cn', util.stripPort('www.baidu.com.cn'))
    assert.equal('', util.stripPort())
  })

  it('util.getCookieScopeDomain(domain)', () => {
    assert.deepEqual(util.getCookieScopeDomain('www.baidu.com.cn'), [
      'www.baidu.com.cn',
      '.www.baidu.com.cn',
      '.baidu.com.cn',
      '.com.cn',
      '.cn'
    ])
    assert.deepEqual(util.getCookieScopeDomain('.www.baidu.com.cn'), [
      'www.baidu.com.cn',
      '.www.baidu.com.cn',
      '.baidu.com.cn',
      '.com.cn',
      '.cn'
    ])
    assert.deepEqual(util.getCookieScopeDomain(''), [])
  })

  it('util.getCookieScopeDomain(domain) 端口号不参与作用域', () => {
    // 域名带端口号时，不应伪造出 .baidu.com.cn:2443、.com.cn:2443 等无效作用域
    assert.deepEqual(util.getCookieScopeDomain('www.baidu.com.cn:2443'), [
      'www.baidu.com.cn',
      '.www.baidu.com.cn',
      '.baidu.com.cn',
      '.com.cn',
      '.cn',
      // 兼容历史版本按带端口号的域名存储的 cookie
      'www.baidu.com.cn:2443',
      '.www.baidu.com.cn:2443'
    ])
  })

  it('util.getCookieScopeDomain(domain) 重复的域名层级不会互相覆盖', () => {
    assert.deepEqual(util.getCookieScopeDomain('a.a.com'), [
      'a.a.com',
      '.a.a.com',
      '.a.com',
      '.com'
    ])
  })

  it('util.normalizeDomain(domain)', () => {
    assert.equal('.baidu.com', util.normalizeDomain('baidu.com'))
    assert.equal('.baidu.com', util.normalizeDomain('.baidu.com'))
    assert.equal('.www.baidu.com.cn', util.normalizeDomain('www.baidu.com.cn:2443'))
    assert.equal('.www.baidu.com.cn', util.normalizeDomain('.www.baidu.com.cn:2443'))
    assert.equal('', util.normalizeDomain())
  })

})
