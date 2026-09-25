/**
 * 回归测试：小程序插件环境不允许覆盖原生方法
 * https://github.com/charleslo1/weapp-cookie/issues/34
 *
 * 宿主对象一旦确定就不能改（各平台的全局对象在模块加载时识别），
 * 所以这里用独立进程加载 dist，模拟插件环境。
 */
const assert = require('assert')

const logs = []
const nativeWarn = console.warn
const nativeError = console.error
console.warn = (...args) => logs.push(['warn', args.join(' ')])
console.error = (...args) => logs.push(['error', args.join(' ')])

// 宿主对象：request 不允许被覆盖（小程序插件的安全机制）
const host = {
  setStorageSync: () => {},
  getStorageSync: () => {},
  request: function nativeRequest (options) {
    options.success({ data: {}, header: { 'Set-Cookie': 'plugin=1; Path=/; Max-Age=1800' } })
  },
  uploadFile: function nativeUploadFile () {},
  downloadFile: function nativeDownloadFile () {}
}
Object.defineProperty(host, 'request', {
  value: host.request,
  writable: false,
  configurable: false
})

global.wx = host
const nativeRequest = host.request

const cookies = require('../../dist/weapp-cookie')

console.warn = nativeWarn
console.error = nativeError

const errors = logs.filter(([level]) => level === 'error')
const warns = logs.filter(([level]) => level === 'warn')

// 1. 不再打印 error（原来是一条 console.error('weapp-cookie: ', err)）
assert.deepEqual(errors, [], '插件环境下不应打印 error 级别日志')
// 2. 无法覆盖时保留宿主原生方法
assert.equal(host.request, nativeRequest, '无法覆盖时应保留原生方法')
// 3. 别名仍然可用
assert.equal(typeof host.requestWithCookie, 'function', 'requestWithCookie 别名应可用')
assert.equal(typeof host.uploadFileWithCookie, 'function', 'uploadFileWithCookie 别名应可用')
assert.equal(typeof host.downloadFileWithCookie, 'function', 'downloadFileWithCookie 别名应可用')
// 4. 只提示一次，并说明该怎么处理
assert.equal(warns.length, 1, '应只打印一条 warn 提示')
assert.ok(/requestWithCookie/.test(warns[0][1]), 'warn 里应提示改用别名')

// 5. install 的返回值能拿到失败详情，便于使用者排查
const result = cookies.install()
assert.deepEqual(result.overrideFailed, ['request'])
assert.deepEqual(result.aliasFailed, [])

// 6. 别名请求可以正常走 cookie 流程
host.requestWithCookie({ url: 'https://plugin.example.com/api' })
assert.equal('plugin=1', cookies.getRequestCookies('plugin.example.com'))

console.log('plugin-host ok')
