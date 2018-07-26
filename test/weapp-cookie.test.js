global.wx = {
  setStorageSync: () => {},
  getStorageSync: () => {},
  request: () => {}
}
const assert = require('assert')

const cookie = require('../dist/weapp-cookie')
const setCookieStr = 'EGG_SESSION=cQgFSy2NnOAAqWu7YUVVEoFWkf2YxXL1pi4GYPBl9ieUPI_YSy6LBvs7lsxB52cZ; domain=baidu.com; path=/; expires=Fri, 27 Jul 2018 04:02:51 GMT; httponly, dwf_sg_task_completion=False; expires=Sat, 25-Aug-2018 04:04:04 GMT; Max-Age=2592000; Path=/; secure;, PSINO=7; domain=.baidu.com; path=/,prod_crm_session=gBz4cg45F7A5TwRuSNgOw5xSRilpiec9Mht7bS9a; expires=Thu, 26-Jul-2018 06:14:05 GMT; Max-Age=7200; path=/; domain=.keketour.com; httponly'

// 测试 weapp-cookie.js
describe('weapp-cookie.js', () => {

  it('cookie.setResponseCookies(setCookieStr, domain)', () => {
    let result = cookie.setResponseCookies(setCookieStr, 'baidu.com')
    assert.equal(true, result.get('baidu.com').has('EGG_SESSION'))
  })

  it('cookie.getRequestCookies(domain)', () => {
    cookie.setResponseCookies(setCookieStr, 'baidu.com')
    let result = cookie.getRequestCookies('baidu.com')
    let value = 'EGG_SESSION=cQgFSy2NnOAAqWu7YUVVEoFWkf2YxXL1pi4GYPBl9ieUPI_YSy6LBvs7lsxB52cZ; dwf_sg_task_completion=False; PSINO=7'
    assert.equal(value, result)
  })

  it('cookie.set(name, value, options)', () => {
    let result = cookie.set('session_id', 'session_id_value', { domain: '.baidu.com' })
    assert.equal('session_id_value', result.value)
  })

  it('cookie.has(name, domain)', () => {
    let result = cookie.has('session_id', 'baidu.com')
    assert.equal(true, result)
  })

  it('cookie.get(name, domain)', () => {
    let result = cookie.get('session_id', 'baidu.com')
    assert.equal('session_id_value', result)
  })

  it('cookie.getCookies(domain)', () => {
    let result = cookie.getCookies('baidu.com')
    assert.equal('session_id_value', result.session_id)
  })

  it('cookie.getCookiesArray(domain)', () => {
    let result = cookie.getCookiesArray('baidu.com')
    assert.equal(4, result.length)
  })

  it('cookie.remove(name, domain)', () => {
    cookie.remove('EGG_SESSION', 'baidu.com')
    let result = cookie.has('EGG_SESSION', 'baidu.com')
    assert.equal(false, result)
  })

  it('cookie.dir()', () => {
    let result = cookie.dir()
    assert.equal('object', typeof result['baidu.com'])
  })

  it('cookie.clearCookies(domain)', () => {
    cookie.clearCookies('baidu.com')
    let result = cookie.getCookiesArray('baidu.com')
    assert.notEqual(0, result.length)

    cookie.clearCookies('.baidu.com')
    result = cookie.getCookiesArray('baidu.com')
    assert.equal(0, result.length)
  })

  it('cookie.clearCookies()', () => {
    let result1 = cookie.getCookiesArray()
    cookie.clearCookies()
    let result2 = cookie.getCookiesArray()
    assert.notEqual(result1.length, result2.length)
  })

})
