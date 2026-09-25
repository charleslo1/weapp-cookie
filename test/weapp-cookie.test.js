// 记录 wx.request 的请求参数，用于测试 wx.request 代理
let lastRequestOptions = null
global.wx = {
  setStorageSync: () => {},
  getStorageSync: () => {},
  // 原始请求实现：weapp-cookie 会在加载时覆写 wx.request 并持有这里的方法。
  // 用例通过 wxRequestHandler 注入响应，或从 lastRequestOptions 读取请求参数
  request: (options) => {
    lastRequestOptions = options
    global.wxRequestHandler && global.wxRequestHandler(options)
  }
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
        // 清掉注入的响应实现，避免影响后面的用例（wx.request 代理用例自己驱动 success）
        global.wxRequestHandler = null
        done()
      }
    })
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

// 回归：https://github.com/charleslo1/weapp-cookie/issues/70
// set-cookie 的 Expires 是 RFC 1123 格式，部分 iOS 真机与 uni-app 用它构造 new Date
// 会打印「new Date 在部分 iOS 下无法正常使用」并刷屏，所以先归一化成 ISO 8601。
describe('weapp-cookies.js Expires 解析', () => {
  it('__normalizeExpires 把 RFC 1123 归一化成 ISO 8601', () => {
    assert.equal(
      'a=1; Expires=2025-12-01T09:48:36+00:00; Path=/',
      cookies.__normalizeExpires('a=1; Expires=Mon, 01 Dec 2025 09:48:36 GMT; Path=/')
    )
    // 带短横线的写法
    assert.equal(
      'a=1; expires=2099-08-25T04:04:04+00:00',
      cookies.__normalizeExpires('a=1; expires=Sat, 25-Aug-2099 04:04:04 GMT')
    )
    // 两位年份
    assert.equal(
      'a=1; Expires=1994-11-06T08:49:37+00:00',
      cookies.__normalizeExpires('a=1; Expires=Sun, 06-Nov-94 08:49:37 GMT')
    )
    // 带时区偏移
    assert.equal(
      'a=1; Expires=2025-12-01T01:48:36+00:00',
      cookies.__normalizeExpires('a=1; Expires=Mon, 01 Dec 2025 09:48:36 +0800')
    )
  })

  it('已经是 ISO 8601 或无法识别的日期保持原样', () => {
    assert.equal(
      'a=1; Expires=2025-12-01T09:48:36+00:00',
      cookies.__normalizeExpires('a=1; Expires=2025-12-01T09:48:36+00:00')
    )
    assert.equal(
      'a=1; Expires=not-a-date',
      cookies.__normalizeExpires('a=1; Expires=not-a-date')
    )
  })

  it('解析后的过期时间与 RFC 1123 字面含义一致', () => {
    let cookie = cookies.parse('a=1; path=/; expires=Mon, 01 Dec 2025 09:48:36 GMT', 'expires.example.com')[0]
    assert.equal(Date.UTC(2025, 11, 1, 9, 48, 36), cookie.expires.getTime())
  })

  it('一个响应里混合多种格式的 Expires 都能解析且互不影响', () => {
    let result = cookies.parse(
      'a=1; expires=Mon, 01 Dec 2025 09:48:36 GMT; path=/, b=2; expires=Sat, 25-Aug-2099 04:04:04 GMT; path=/',
      'expires.example.com'
    )
    assert.deepEqual(result.map(cookie => cookie.name), ['a', 'b'])
    assert.equal(Date.UTC(2025, 11, 1, 9, 48, 36), result[0].expires.getTime())
    assert.equal(Date.UTC(2099, 7, 25, 4, 4, 4), result[1].expires.getTime())
  })
})

// 回归：https://github.com/charleslo1/weapp-cookie/issues/67
// 用户把手机时间改到未来后，服务端下发的 cookie 会被误判过期、直接丢弃。
describe('weapp-cookies.js 时间校准', () => {
  const DOMAIN = 'calibrate.example.com'

  it('setNowTime 校准后，设备时间偏到未来也不会误判过期', () => {
    let nativeNow = Date.now
    let real = nativeNow()
    try {
      // 设备时间被用户改到 30 天以后
      Date.now = () => real + 30 * 86400000
      // 未校准：5 天后才过期的 cookie 被当成已过期并丢弃
      cookies.setResponseCookies(
        'uncalibrated=1; Expires=' + new Date(real + 5 * 86400000).toUTCString() + '; Path=/',
        DOMAIN
      )
      assert.equal(false, cookies.has('uncalibrated', DOMAIN))

      // 校准到真实时间后，同样的 cookie 可以正常保存
      cookies.setNowTime(real)
      cookies.setResponseCookies(
        'calibrated=1; Expires=' + new Date(real + 5 * 86400000).toUTCString() + '; Path=/',
        DOMAIN
      )
      assert.equal(true, cookies.has('calibrated', DOMAIN))
      assert.equal(true, Math.abs(cookies.now().getTime() - real) < 1000)
    } finally {
      Date.now = nativeNow
      cookies.setNowTime()
    }
  })

  it('setNowTime() 缺省时恢复使用设备时间', () => {
    let before = Date.now()
    cookies.setNowTime(before + 86400000)
    assert.equal(true, cookies.now().getTime() - Date.now() > 86000000)

    cookies.setNowTime()
    assert.equal(true, Math.abs(cookies.now().getTime() - Date.now()) < 1000)
  })

  it('setNowTime 的时间格式无法解析时给出明确错误', () => {
    assert.throws(() => cookies.setNowTime('not-a-date'), /setNowTime/)
    cookies.setNowTime()
  })

  it('校准时间后 maxAge 仍然按经过的秒数计算', () => {
    let nativeNow = Date.now
    let real = nativeNow()
    try {
      cookies.setNowTime(real)
      cookies.setResponseCookies('age=1; Max-Age=3600; Path=/', DOMAIN)
      let cookie = cookies.getCookie('age', DOMAIN)
      assert.equal(false, cookie.isExpired())

      // 校准时间往前走 2 小时（设备时间不变）
      cookies.setNowTime(real + 2 * 3600 * 1000)
      assert.equal(true, cookie.isExpired())
      assert.equal(false, cookies.has('age', DOMAIN))
    } finally {
      Date.now = nativeNow
      cookies.setNowTime()
    }
  })
})
