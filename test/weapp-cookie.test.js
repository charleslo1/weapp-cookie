global.wx = {
  setStorageSync: () => {},
  getStorageSync: () => {},
  // 原始请求实现，由测试用例注入（weapp-cookie 会在加载时覆写 wx.request 并持有这里的方法）
  request: (options) => { global.wxRequestHandler && global.wxRequestHandler(options) }
}
const assert = require('assert')

const cookies = require('../dist/weapp-cookie')
// 注意：过期时间取足够远的未来，避免测试结果随时间失效
const setCookieStr = 'EGG_SESSION=cQgFSy2NnOAAqWu7YUVVEoFWkf2YxXL1pi4GYPBl9ieUPI_YSy6LBvs7lsxB52cZ; domain=baidu.com; path=/; expires=Fri, 27 Jul 2080 04:02:51 GMT; httponly, dwf_sg_task_completion=False; expires=Sat, 25-Aug-2080 04:04:04 GMT; Max-Age=2592000; Path=/; secure;, PSINO=7; domain=.baidu.com; path=/,prod_crm_session=gBz4cg45F7A5TwRuSNgOw5xSRilpiec9Mht7bS9a; expires=Thu, 26-Jul-2080 06:14:05 GMT; Max-Age=2592000; path=/; domain=.taobao.com; httponly'

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
    // EGG_SESSION、PSINO、dwf_sg_task_completion、session_id，prod_crm_session 属于 .taobao.com
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

// 一个响应返回多个 set-cookie 的情况：https://github.com/charleslo1/weapp-cookie/issues/53
describe('response with multiple set-cookie', () => {
  const multiSetCookieStr = 'EGG_SESSION=abc; domain=baidu.com; path=/; expires=Fri, 27 Jul 2080 04:02:51 GMT; httponly, dwf_sg_task_completion=False; expires=Sat, 25-Aug-2080 04:04:04 GMT; Max-Age=2592000; Path=/; secure, PSINO=7; domain=.baidu.com; path=/'

  it('cookies.parse(setCookieStr) 解析逗号拼接的多个 cookie', () => {
    let result = cookies.parse(multiSetCookieStr, 'baidu.com')
    assert.deepEqual(result.map(cookie => cookie.name), ['EGG_SESSION', 'dwf_sg_task_completion', 'PSINO'])
  })

  it('cookies.parse(setCookieArray) 兼容 ios 设备返回数组的情况', () => {
    let result = cookies.parse([
      'EGG_SESSION=abc; domain=baidu.com; path=/',
      'PSINO=7; domain=.baidu.com; path=/; HttpOnly'
    ], 'baidu.com')
    assert.deepEqual(result.map(cookie => cookie.name), ['EGG_SESSION', 'PSINO'])
  })

  it('cookies.setResponseCookies(setCookieArray, domain) 不会因为 set-cookie 是数组而报错', () => {
    let result = cookies.setResponseCookies([
      'array_a=1; path=/',
      'array_b=2; path=/; Max-Age=1800'
    ], 'array.example.com')
    assert.equal(true, result.get('array.example.com').has('array_a'))
    assert.equal(true, result.get('array.example.com').has('array_b'))
  })

  it('cookies.parse(setCookieStr) 兼容 QQ 小程序分号拼接的多个 cookie', () => {
    let result = cookies.parse('key1=value1; domain=/site; path=/; secure;key2=value2; path=/', 'qq.com')
    assert.deepEqual(result.map(cookie => cookie.name), ['key1', 'key2'])
  })

  it('cookies.parse(setCookieStr) 不把 cookie 属性解析成 cookie', () => {
    let result = cookies.parse('JSESSIONID=abc;path=/;Max-Age=1800;HttpOnly;SameSite=Lax, route=38ac;Path=/', 'example.com')
    assert.deepEqual(result.map(cookie => cookie.name), ['JSESSIONID', 'route'])
  })

  it('cookies.parse(setCookieStr) 兼容属性无值且紧跟逗号分隔的多个 cookie', () => {
    // https://github.com/charleslo1/weapp-cookie/issues/39 中反馈的真实 header
    let result = cookies.parse('JSESSIONID=A9118060632F0DA9A0B967ADC35DF903;Path=/;HttpOnly,route=38ac858752aa1b02deb40f6abc4d204f;Path=/', 'example.com')
    assert.deepEqual(result.map(cookie => cookie.name), ['JSESSIONID', 'route'])
    assert.equal('/', result[0].path)
    assert.equal(true, result[0].httpOnly)
    assert.equal('/', result[1].path)
  })

  it('wx.request 收到数组形式的 Set-Cookie 时可以正常解析并保存', (done) => {
    global.wxRequestHandler = (options) => {
      options.success({
        data: {},
        header: {
          'Set-Cookie': ['request_a=1; path=/; HttpOnly', 'request_b=2; path=/; Max-Age=1800']
        }
      })
    }

    wx.request({
      url: 'https://request.example.com/api/user',
      success: () => {
        let result = cookies.getCookies('request.example.com')
        assert.equal('1', result.request_a)
        assert.equal('2', result.request_b)
        assert.equal(undefined, result['Max-Age'])
        done()
      }
    })
  })
})
