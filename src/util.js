/**
 * Util 类
 */
class Util {
  /**
   * 剥离域名中的端口号
   * 端口号不属于域名的一部分，参与作用域计算会得到错误的结果，
   * 例如 www.baidu.com.cn:2443 会被计算出 .baidu.com.cn:2443、.com.cn:2443 等无效作用域
   * @param  {String} domain 域名
   * @return {String}        不含端口号的域名
   */
  stripPort (domain = '') {
    return domain.replace(/:\d+$/g, '')
  }

  /**
   * 根据域名获取该域名的 cookie 作用域范围列表
   * @param  {String} domain 指定域名
   * @return {Array}         cookie 作用域范围列表
   */
  getCookieScopeDomain (domain = '') {
    if (!domain) return []

    // 原始域名（可能带端口号），用于兼容历史版本存储的 cookie
    let originDomain = domain.replace(/^\.+/ig, '')

    // 端口号不属于域名的一部分，需要先剥离，否则会伪造出错误的父级作用域
    domain = this.stripPort(originDomain)

    // 获取 cookie 作用域范围列表：域名本身 + 各级父域名
    let scopes = [domain]
    domain.split('.').forEach((name, index, names) => {
      scopes.push('.'.concat(names.slice(index).join('.')))
    })

    // 兼容历史版本（未剥离端口号）按带端口号的域名存储的 cookie
    if (originDomain !== domain) {
      scopes.push(originDomain, '.'.concat(originDomain))
    }

    return scopes
  }

  /**
   * 根据最新的 RFC 6265 标准化域名作用域
   * @param  {String} domain 域名
   * @return {String}        标准化后的域名
   */
  normalizeDomain (domain = '') {
    // 端口号不属于域名的一部分，需要先剥离
    return this.stripPort(domain).replace(/^(\.*)?(?=\S)/ig, '.')
  }
}

export default new Util()
