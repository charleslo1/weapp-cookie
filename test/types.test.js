/**
 * 回归测试：TypeScript 类型声明
 * https://github.com/charleslo1/weapp-cookie/issues/40
 *
 * 这里不做完整的类型检查（避免引入额外依赖），只保证：
 *   1. package.json 的 types 字段指向存在的声明文件；
 *   2. 声明文件里声明的方法在运行时都存在，避免类型声明与实际 API 脱节。
 */
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

describe('TypeScript 类型声明', () => {
  it('package.json 的 types 字段指向声明文件，且文件会随包发布', () => {
    let pkg = require(path.join(root, 'package.json'))
    assert.ok(pkg.types, 'package.json 应声明 types 字段')
    assert.ok(fs.existsSync(path.join(root, pkg.types)), 'types 指向的声明文件应存在')
    assert.ok(pkg.files.indexOf(pkg.types) >= 0, '声明文件应包含在 files 里发布')
  })

  it('声明文件里的方法在运行时都存在', () => {
    let dts = fs.readFileSync(path.join(root, 'index.d.ts'), 'utf8')
    let cookies = require('../dist/weapp-cookie')

    // 只取 CookieStore 这一段，Cookie 类的方法不在 cookieStore 实例上
    let section = dts.slice(dts.indexOf('declare class CookieStore'))
    let cookieClassAt = section.indexOf('declare class Cookie ')
    if (cookieClassAt >= 0) section = section.slice(0, cookieClassAt)

    // 取出 CookieStore 上声明的方法名
    let methods = []
    let methodRe = /^\s{2}([A-Za-z_$][\w$]*)\s*\(/gm
    let matched
    while ((matched = methodRe.exec(section))) {
      methods.push(matched[1])
    }

    assert.ok(methods.length > 5, '应声明多个方法，实际：' + methods.join(', '))
    methods.forEach((name) => {
      assert.equal('function', typeof cookies[name], '声明的 ' + name + ' 在运行时不存在')
    })
  })
})
