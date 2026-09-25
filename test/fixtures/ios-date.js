/**
 * 回归测试：Expires 用 RFC 1123 格式时不触发 iOS / uni-app 的 new Date 警告
 * https://github.com/charleslo1/weapp-cookie/issues/70
 *
 * uni-app 与部分 iOS 真机上，new Date('Mon, 01 Dec 2025 09:48:36 GMT')
 * 这类调用会被判为不支持的格式并在控制台刷屏，这里用一个
 * 「只要用 RFC 1123 字符串构造 Date 就报错」的 Date 替身来复现。
 */
const assert = require('assert')

const NativeDate = Date
const unsupported = []

class StrictDate extends NativeDate {
  constructor (...args) {
    if (typeof args[0] === 'string' && /[a-z]{3}/i.test(args[0]) && /gmt|utc/i.test(args[0])) {
      unsupported.push(args[0])
    }
    super(...args)
  }
}
global.Date = StrictDate

global.wx = {
  setStorageSync: () => {},
  getStorageSync: () => {},
  request: () => {}
}

const cookies = require('../../dist/weapp-cookie')

const setCookieStr = 'EGG_SESSION=abc; domain=baidu.com; path=/; expires=Mon, 01 Dec 2025 09:48:36 GMT; httponly'
const parsed = cookies.parse(setCookieStr, 'baidu.com')

// 1. 不应该拿 RFC 1123 字符串去构造 Date（否则 iOS/uni-app 会刷警告）
assert.deepEqual(unsupported, [], '不应使用 RFC 1123 字符串构造 Date')
// 2. 过期时间仍然解析正确（GMT 即 UTC）
assert.equal(NativeDate.UTC(2025, 11, 1, 9, 48, 36), parsed[0].expires.getTime())
// 3. 其它格式（带短横线的写法、两位年份、带时区偏移）同样正确
assert.equal(
  NativeDate.UTC(2099, 7, 25, 4, 4, 4),
  cookies.parse('a=1; expires=Sat, 25-Aug-2099 04:04:04 GMT', 'baidu.com')[0].expires.getTime()
)
assert.equal(
  NativeDate.UTC(1994, 10, 6, 8, 49, 37),
  cookies.parse('b=1; expires=Sun, 06-Nov-94 08:49:37 GMT', 'baidu.com')[0].expires.getTime()
)
assert.equal(
  NativeDate.UTC(2025, 11, 1, 1, 48, 36),
  cookies.parse('c=1; expires=Mon, 01 Dec 2025 09:48:36 +0800', 'baidu.com')[0].expires.getTime()
)
// 4. 无法识别的日期保持原样，交给 set-cookie-parser 兜底
const fallback = cookies.parse('d=1; expires=Mon, 01 Dec 2025 09:48:36 GMT, e=2; path=/', 'baidu.com')
assert.deepEqual(fallback.map(cookie => cookie.name), ['d', 'e'])

console.log('ios-date ok')
