/**
 * Util 类
 */
class Util {
  /**
   * 根据域名获取该域名的 cookie 作用域范围列表
   * @param  {String} domain 指定域名
   * @return {String}        cookie 作用域范围列表
   */
  getCookieScopeDomain (domain = '') {
    if (!domain) return []

    // 获取 cookie 作用域范围列表
    domain = domain.replace(/^\.+/ig, '')
    let scopes = domain.split('.').map(k => ['.', domain.slice(domain.indexOf(k))].join(''))

    return [domain].concat(scopes)
  }
}

export default new Util()
