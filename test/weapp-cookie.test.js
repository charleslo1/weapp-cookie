global.wx = {
  setStorageSync: () => {},
  getStorageSync: () => {},
  request: () => {}
}
const assert = require('assert')

const cookies = require('../dist/weapp-cookie')
// 注意：cookie 的 expires 用远期时间，避免测试套件随时间流逝而失效
const setCookieStr = 'EGG_SESSION=cQgFSy2NnOAAqWu7YUVVEoFWkf2YxXL1pi4GYPBl9ieUPI_YSy6LBvs7lsxB52cZ; domain=baidu.com; path=/; expires=Fri, 27 Jul 2099 04:02:51 GMT; httponly, dwf_sg_task_completion=False; expires=Sat, 25-Aug-2099 04:04:04 GMT; Max-Age=2592000; Path=/; secure;, PSINO=7; domain=.baidu.com; path=/,prod_crm_session=gBz4cg45F7A5TwRuSNgOw5xSRilpiec9Mht7bS9a; expires=Thu, 26-Jul-2099 06:14:05 GMT; Max-Age=2592000; path=/; domain=.taobao.com; httponly'

// 测试 weapp-cookie.js
describe('weapp-cookies.js', () => {

  it('cookies.config(options)', () => {
    cookies.config({ requestAlias: 'requestx' })
    assert.equal(wx.requestWithCookie, wx.requestx)
  })

  it('cookies.setResponseCookies(setCookieStr, domain)', () => {
    let result = cookies.setResponseCookies(setCookieStr, 'baidu.com')
    assert.equal(true, result.get('.baidu.com').has('EGG_SESSION'))
  })

  it('cookies.getRequestCookies(domain)', () => {
    cookies.setResponseCookies(setCookieStr, 'baidu.com')
    let result = cookies.getRequestCookies('baidu.com')
    let value = 'EGG_SESSION=cQgFSy2NnOAAqWu7YUVVEoFWkf2YxXL1pi4GYPBl9ieUPI_YSy6LBvs7lsxB52cZ; PSINO=7; dwf_sg_task_completion=False'
    assert.equal(value, result)
  })

  it('cookies.set(name, value, options)', () => {
    let result = cookies.set('session_id', 'session_id_value', { domain: 'baidu.com' })
    assert.equal('session_id_value', result.value)
  })

  it('cookies.has(name, domain)', () => {
    let result = cookies.has('session_id', 'baidu.com')
    assert.equal(true, result)
  })

  it('cookies.get(name, domain)', () => {
    let result = cookies.get('session_id', 'baidu.com')
    assert.equal('session_id_value', result)
  })

  it('cookies.getCookie(name, domain)', () => {
    let result = cookies.getCookie('session_id', 'baidu.com')
    assert.equal('session_id', result.name)
  })

  it('cookies.getCookies(domain)', () => {
    let result = cookies.getCookies('baidu.com')
    assert.equal('session_id_value', result.session_id)
  })

  it('cookies.getCookiesArray(domain)', () => {
    let result = cookies.getCookiesArray('baidu.com')
    assert.equal(4, result.length)
  })

  it('cookies.remove(name, domain)', () => {
    cookies.remove('EGG_SESSION', 'baidu.com')
    let result = cookies.has('EGG_SESSION', 'baidu.com')
    assert.equal(false, result)
  })

  it('cookies.dir()', () => {
    let result = cookies.dir()
    assert.equal('object', typeof result['baidu.com'])
  })

  it('cookies.clearCookies(domain)', () => {
    cookies.clearCookies('baidu.com')
    let result = cookies.getCookiesArray('baidu.com')
    assert.notEqual(0, result.length)

    cookies.clearCookies('.baidu.com')
    result = cookies.getCookiesArray('baidu.com')
    assert.equal(0, result.length)
  })

  it('cookies.clearCookies()', () => {
    let result1 = cookies.getCookiesArray()
    cookies.clearCookies()
    let result2 = cookies.getCookiesArray()
    assert.notEqual(result1.length, result2.length)
  })

})

// 回归：https://github.com/charleslo1/weapp-cookie/issues/56
// 服务端用 `Set-Cookie: xxx=; Max-Age=0` 删除 cookie 时，maxAge 不能被当成假值丢掉，
// 否则该 cookie 既不会被标记过期，后续请求还会继续携带。
describe('weapp-cookies.js set-cookie Max-Age:0', () => {
  const DOMAIN = 'example.com'

  it('Max-Age=0 的 set-cookie 不会留在 store 里', () => {
    cookies.setResponseCookies('token=deleted; Max-Age=0; Path=/', DOMAIN)
    assert.equal(false, cookies.has('token', DOMAIN))
    assert.equal(undefined, cookies.getCookie('token', DOMAIN))
  })

  it('Max-Age=0 的 set-cookie 会清掉已存在的 cookie', () => {
    cookies.setResponseCookies('token=alive; Max-Age=3600; Path=/', DOMAIN)
    assert.equal(true, cookies.has('token', DOMAIN))
    assert.equal('token=alive', cookies.getRequestCookies(DOMAIN))

    cookies.setResponseCookies('token=; Max-Age=0; Path=/', DOMAIN)
    assert.equal(false, cookies.has('token', DOMAIN))
    assert.equal('', cookies.getRequestCookies(DOMAIN))
  })

  it('maxAge 为 0 的 Cookie 立即过期', () => {
    let cookie = cookies.set('gone', '', { domain: DOMAIN, maxAge: 0 })
    assert.equal(0, cookie.maxAge)
    assert.equal(true, cookie.isExpired())
    assert.equal(false, cookies.has('gone', DOMAIN))
  })

  it('maxAge 非 0 时保持原有解析结果', () => {
    let cookie = cookies.set('keep', 'v', { domain: DOMAIN, maxAge: 3600 })
    assert.equal(3600, cookie.maxAge)
    assert.equal(false, cookie.isExpired())
    assert.equal(true, cookies.has('keep', DOMAIN))
  })
})
