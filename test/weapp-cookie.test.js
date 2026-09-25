// 记录 wx.request 的请求参数，用于测试 wx.request 代理
let lastRequestOptions = null
global.wx = {
  setStorageSync: () => {},
  getStorageSync: () => {},
  request: (options) => { lastRequestOptions = options }
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

// 测试域名带端口号的情况：https://github.com/charleslo1/weapp-cookie/issues/43
describe('weapp-cookies.js 域名带端口号', () => {

  it('cookies.setResponseCookies(setCookieStr, domain) 支持带端口号的域名', () => {
    cookies.clearCookies()
    let result = cookies.setResponseCookies('token=1; domain=.b.com; path=/, session_id=s1; path=/; max-age=3600', 'www.b.com:2443')
    // 带 domain 的 cookie 存到 domain 作用域下，未带 domain 的 cookie 回落到请求域名（不含端口号）
    assert.equal(true, result.get('.b.com').has('token'))
    assert.equal(true, result.get('www.b.com').has('session_id'))
  })

  it('cookies.getRequestCookies(domain) 端口号不参与作用域', () => {
    cookies.clearCookies()
    cookies.setResponseCookies('token=1; domain=.b.com; path=/', 'www.b.com:2443')

    // 同级、子级域名可以带上父级域名的 cookie（只支持当前域名与父子域名共享）
    assert.equal('token=1', cookies.getRequestCookies('www.b.com:2443'))
    assert.equal('token=1', cookies.getRequestCookies('www.b.com'))
    assert.equal('token=1', cookies.getRequestCookies('a.b.com:2443'))
    // 不相关域名不会带上
    assert.equal('', cookies.getRequestCookies('www.a.com:2443'))
  })

  it('cookies.getRequestCookies(domain) 同一域名的不同端口共享 cookie', () => {
    cookies.clearCookies()
    cookies.setResponseCookies('session_id=s1; path=/; max-age=3600', 'www.b.com:2443')

    assert.equal('session_id=s1', cookies.getRequestCookies('www.b.com:2443'))
    assert.equal('session_id=s1', cookies.getRequestCookies('www.b.com:8080'))
    assert.equal('session_id=s1', cookies.getRequestCookies('www.b.com'))
  })

  it('cookies.set(name, value, options) 支持带端口号的域名', () => {
    cookies.clearCookies()
    cookies.set('uid', '100', { domain: 'www.b.com:2443' })

    assert.equal('100', cookies.get('uid', 'www.b.com:2443'))
    assert.equal('100', cookies.get('uid', 'www.b.com:8080'))
    assert.equal(true, cookies.has('uid', 'www.b.com'))

    cookies.remove('uid', 'www.b.com:2443')
    assert.equal(false, cookies.has('uid', 'www.b.com'))
  })

  it('兼容历史版本按带端口号的域名存储的 cookie', () => {
    cookies.clearCookies()
    // 模拟历史版本（未剥离端口号）存储的 cookie
    cookies.set('legacy', '1', { domain: 'www.b.com:2443' })
    let cookie = cookies.getCookie('legacy', 'www.b.com')
    cookie.domain = 'www.b.com:2443'
    cookies.setCookiesArray([cookie])
    // 移除不带端口号的存储键，只保留历史版本存储的键
    cookies.clearCookies('www.b.com')

    assert.equal('legacy=1', cookies.getRequestCookies('www.b.com:2443'))
  })

})

describe('weapp-cookies.js wx.request 代理', () => {

  it('wx.request 域名带端口号时 cookie 上送正确', () => {
    cookies.clearCookies()

    // 接口 A：域名带端口号，响应中设置了父级域名 .b.com 的 cookie
    wx.request({ url: 'https://www.b.com:2443/login', success: function () {} })
    lastRequestOptions.success({ header: { 'Set-Cookie': 'token=1; domain=.b.com; path=/; max-age=3600' } })

    // 接口 B：同一域名的其它端口、同级与子级域名均能带上该 cookie
    wx.request({ url: 'https://www.b.com:8080/user', success: function () {} })
    assert.equal('token=1', lastRequestOptions.header['Cookie'])

    wx.request({ url: 'https://a.b.com:2443/user', success: function () {} })
    assert.equal('token=1', lastRequestOptions.header['Cookie'])

    // 不相关域名不会误带上
    wx.request({ url: 'https://www.a.com:2443/user', success: function () {} })
    assert.equal('', lastRequestOptions.header['Cookie'])
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

  it('Max-Age 为负数时同样立即过期（RFC 6265）', () => {
    cookies.setResponseCookies('nag=alive; Max-Age=3600; Path=/', DOMAIN)
    assert.equal(true, cookies.has('nag', DOMAIN))

    cookies.setResponseCookies('nag=; Max-Age=-1; Path=/', DOMAIN)
    assert.equal(false, cookies.has('nag', DOMAIN))
    assert.equal(false, /nag=/.test(cookies.getRequestCookies(DOMAIN)))
  })

  it('未设置 maxAge 的会话 cookie 不受影响', () => {
    cookies.setResponseCookies('session=1; Path=/', DOMAIN)
    assert.equal(true, cookies.has('session', DOMAIN))
  })
})
