/**
 * 回归测试：支付宝小程序 my.request 的 enableCookie
 * https://github.com/charleslo1/weapp-cookie/issues/62
 *
 * 支付宝宿主自带 cookie 机制，与本库用 Storage 模拟的 cookie jar 叠加会互相干扰，
 * 所以请求代理里默认关闭宿主的 enableCookie，并允许使用者显式覆盖。
 */
const assert = require('assert')

const requests = []
const store = {}
global.my = {
  // 支付宝小程序 getStorageSync / setStorageSync 的参数形式与微信不同
  setStorageSync: ({ key, data }) => { store[key] = data },
  getStorageSync: ({ key }) => ({ data: store[key] }),
  request: (options) => { requests.push(options) }
}

const cookies = require('../../dist/weapp-cookie')

assert.equal('my', my.platform)

// 默认关闭宿主 cookie，由本库接管
my.request({ url: 'https://my.example.com/api' })
assert.equal(false, requests[0].enableCookie)

// 使用者显式传入时不覆盖
my.request({ url: 'https://my.example.com/api', enableCookie: true })
assert.equal(true, requests[1].enableCookie)

// 也可以全局配置成打开
cookies.config({ alipayEnableCookie: true })
my.request({ url: 'https://my.example.com/api' })
assert.equal(true, requests[2].enableCookie)

cookies.config({ alipayEnableCookie: false })
my.request({ url: 'https://my.example.com/api' })
assert.equal(false, requests[3].enableCookie)

// 关闭宿主 cookie 后，本库自己的 cookie jar 仍然正常工作
cookies.set('uid', '100', { domain: 'my.example.com' })
my.request({ url: 'https://my.example.com/api' })
assert.equal('uid=100', requests[4].header.Cookie)
assert.equal(5, requests.length)

console.log('alipay-enable-cookie ok')
