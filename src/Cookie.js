import cookieParser from 'set-cookie-parser'
import util from './util'

/**
 * Cookie 类
 */
class Cookie {
  /**
   * 构造函数
   */
  constructor (props) {
    this.name = props.name || ''
    this.value = props.value || ''
    // other
    this.domain = props.domain || ''
    this.path = props.path || '/'
    this.expires = props.expires ? new Date(props.expires) : null
    this.maxAge = props.maxAge ? parseInt(props.maxAge) : null
    this.httpOnly = !!props.httpOnly
    // 记录时间
    this.dateTime = props.dateTime ? new Date(props.dateTime) : new Date()
  }

  /**
   * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
   */
  set (setCookieStr = '') {
    var cookie = cookieParser.parse(setCookieStr)[0]
    if (cookie) {
      Object.assign(this, cookie)
      // 更新设置时间
      this.dateTime = new Date()
    }

    return this
  }

  /**
   * 合并 cookie
   * @param  {Cookie} cookie cookie 对象
   * @return {Cookie}        this
   */
  merge (cookie) {
    return Object.assign(this, cookie)
  }

  /**
   * 验证 cookie 是否还有效
   * @return {Boolean} 是否有效
   */
  isExpired () {
    // maxAge 为 0，无效
    if (this.maxAge === 0) {
      return true
    }
    // 存活秒数超出 maxAge，无效
    if (this.maxAge > 0) {
      let seconds = (Date.now() - this.dateTime.getTime()) / 1000
      return seconds > this.maxAge
    }
    // expires 小于当前时间，无效
    if (this.expires && this.expires < new Date()) {
      return true
    }
    return false
  }

  /**
   * 验证 cookie 是否可持久化
   * @return {Boolean} 是否可持久化
   */
  isPersistence () {
    return this.maxAge ? this.maxAge > 0 : true
  }

  /**
   * 验证 cookie 是否在指定的 domain 范围内
   * @param  {String}  domain    域名
   * @return {Boolean}           是否在指定的 domain 范围内
   */
  isInDomain (domain) {
    let scopeDomains = util.getCookieScopeDomain(domain)
    return scopeDomains.indexOf(this.domain) >= 0
  }

  /**
   * 验证 cookie 是否在指定的 path 范围内
   * @param  {String}  path    url路径
   * @return {Boolean}         是否在指定的 path 范围内
   */
  isInPath (path) {
    return path.indexOf(this.path) === 0 || this.path.replace(/\/$/, '') === path
  }

  /**
   * 重写对象的 toString 方法
   */
  toString () {
    return [this.name, this.value].join('=')
  }
}

export default Cookie
