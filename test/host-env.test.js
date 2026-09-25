/**
 * 运行环境相关的回归测试
 *
 * 宿主对象（wx / my / uni）是在模块加载时识别的，这类场景无法在同一个进程里反复模拟，
 * 所以每个场景放在独立进程的 fixture 里执行（fixture 断言失败会以非 0 退出码结束）。
 */
const assert = require('assert')
const path = require('path')
const { execFileSync } = require('child_process')

function runFixture (name) {
  return execFileSync(process.execPath, [path.join(__dirname, 'fixtures', name)], {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..')
  })
}

describe('运行环境兼容', () => {
  it('#34 插件环境下原生方法不允许覆盖：不报错、保留原生方法、别名可用并给出一次提示', () => {
    let output = runFixture('plugin-host.js')
    assert.ok(/plugin-host ok/.test(output), output)
  })

  it('#58 宿主对象晚于本库出现：可以安装并正常存取 cookie', () => {
    let output = runFixture('late-host.js')
    assert.ok(/late-host ok/.test(output), output)
  })

  it('#70 Expires 为 RFC 1123 格式时不触发 iOS / uni-app 的 new Date 警告', () => {
    let output = runFixture('ios-date.js')
    assert.ok(/ios-date ok/.test(output), output)
  })

  it('#62 支付宝小程序默认关闭宿主的 enableCookie', () => {
    let output = runFixture('alipay-enable-cookie.js')
    assert.ok(/alipay-enable-cookie ok/.test(output), output)
  })
})
