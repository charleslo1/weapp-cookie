/**
 * 回归测试：宿主对象晚于本库出现（uni-app APP 端）
 * https://github.com/charleslo1/weapp-cookie/issues/58
 *
 * 在入口文件里 import 'weapp-cookie' 时 uni 对象可能还没有挂到全局，
 * 此时可以用 cookies.config({ host: uni }) 在宿主就绪后再安装。
 */
const assert = require('assert')

const cookies = require('../../dist/weapp-cookie')

// 库加载时没有宿主对象，这里不应该报错
assert.equal(cookies.getCookiesArray().length, 0)

// 宿主对象就绪
const store = {}
global.uni = {
  getStorageSync: (key) => store[key],
  setStorageSync: (key, value) => { store[key] = value },
  request: function nativeRequest (options) {
    options.success({ data: {}, header: { 'Set-Cookie': 'late=1; Path=/; Max-Age=1800' } })
  }
}
const nativeRequest = global.uni.request

// config 返回实例本身，安装结果可以从 install 拿到
assert.equal(cookies, cookies.config({ host: global.uni }))
const result = cookies.install()
assert.deepEqual(result.overrideFailed, [])
assert.equal(typeof uni.requestWithCookie, 'function', '应注册别名')
assert.equal(typeof uni.uploadFileWithCookie, 'function', '应注册别名')
assert.notEqual(uni.request, nativeRequest, '应覆盖宿主 request')

// 请求 → 保存 cookie → 后续请求带上 cookie
uni.request({ url: 'https://late.example.com/api' })
assert.equal('late=1', cookies.getRequestCookies('late.example.com'))
// cookie 落到宿主自己的 Storage 里
assert.ok(store.__cookie_store__, 'cookie 应写入宿主 Storage')
assert.equal(1, store.__cookie_store__.length)

// 改回原来的宿主对象不影响已安装的实例
assert.equal(typeof cookies.get('late', 'late.example.com'), 'string')

console.log('late-host ok')
