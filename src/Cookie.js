import cookieParser from 'set-cookie-parser'

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
    this.path = props.path || ''
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
    return Object(this, cookie)
  }

  /**
   * 验证 cookie 是否还有效
   * @return {Boolean} 是否有效
   */
  validate () {
    // maxAge 为 0，无效
    if (this.maxAge === 0) {
      return false
    }
    // 存活秒数超出 maxAge，无效
    if (this.maxAge > 0) {
      let seconds = (Date.now() - this.dateTime.getTime()) / 1000
      return seconds < this.maxAge
    }
    // expires 小于当前时间，无效
    if (this.expires && this.expires < new Date()) {
      return false
    }
    return true
  }

  /**
   * 验证 cookie 是否可持久化
   * @return {Boolean} 是否可持久化
   */
  isPersistence () {
    return this.maxAge ? this.maxAge > 0 : true
  }

  /**
   * 重写对象的 toString 方法
   */
  toString () {
    return [this.name, this.value].join('=')
  }
}

export default Cookie
