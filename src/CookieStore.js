/**
 * CookieStore 类
 */
class CookieStore {
  /**
   * 构造函数
   */
  constructor () {
    this.storageKey = 'cookie_store'
    this.cookies = this.readFromStorage()
  }

  /**
   * 获取 cookies
   */
  getCookies(domain) {
    let filterCookies = this.cookies.filter((item) => {
      if (item.domain !== domain) return false
      return item.validate()
    })

    return filterCookies.map((item) => item.toString()).join('; ')
  }

  /**
   * 设置 cookies
   */
  setCookies(domain, cookieStr) {
    let parsedCookies = this.parseCookies(domain, cookieStr)
    this.cookies = this.cookies.concat(parsedCookies)
    this.saveToStorage()
  }

  /**
   * 将 cookies 保存到 Storage
   */
  saveToStorage() {
    // 只存储可持久化 cookie
    let saveCookies = this.cookies.filter((item) => {
      return item.isPersistence()
    })
    wx.setStorageSync(this.storageKey, saveCookies)
  }

  /**
   * 从 Storage 读取 cookies
   */
  readFromStorage() {
    let cookies = wx.getStorageSync(this.storageKey) || []
    this.cookies = cookies.map((item) => new Cookie(item))
    return this.cookies
  }

  /**
   * 清除 cookies
   */
  clearCookies (domain) {
    this.cookies = domain ? this.cookies.filter((item) => item.domain !== domain) : []
    this.saveToStorage()
  }

  /**
   * 切分 set-cookie 字段
   */
  parseCookies(domain, setCookieStr = '') {
    // 切分 cookies
    let cookies = setCookieStr.split(',');
    let fixCookies = [];

    // 修复被切分的 cookies
    cookies.forEach((item) => {
      if (item.match(/^\S+\=/ig)) {
        fixCookies.push(item)
      } else {
        let lastIndex = fixCookies.length - 1
        fixCookies[lastIndex] = [fixCookies[lastIndex], item].join(',')
      }
    })

    // parse
    return fixCookies.map((item) => new Cookie({ domain: domain }).set(item))
  }
}

/**
 * Cookie 类
 */
class Cookie {
  /**
   * 构造函数
   */
  constructor(obj) {
    this.key = obj.key || ''
    this.value = obj.value || ''
    // other
    this.domain = obj.domain || ''
    this.path = obj.path || ''
    this.expires = obj.expires ? new Date(obj.expires) : null
    this.maxAge = obj.maxAge ? parseInt(obj.maxAge) : null
    this.httpOnly = !!obj.httpOnly
    // 记录时间
    this.dateTime = obj.dateTime ? new Date(obj.dateTime) : new Date()
  }

  /**
   * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
   */
  set(setCookieStr = '') {
    // 解析并设置 cookie 属性值
    let arr = setCookieStr.split(/\s*\;\s*/g)
    arr.forEach((item, i) => {
      let temp = item.split('=')
      if (i === 0) {
        this.key = temp[0]
        this.value = temp[1]
      } else {
        let prop = temp[0]
        let value = temp[1]
        prop = prop.replace(/-/g, '').replace(/^(\S)/g, (prop[0] || '').toLowerCase())

        switch (prop) {
          case 'maxAge':
            this.maxAge = parseInt(value)
            break
          case 'expires':
            this.expires = new Date(value)
            break
          case 'httpOnly':
            this.httpOnly = true
            break
          default:
            this[prop] = value
            break
        }
      }
    })

    // 更新设置时间
    this.dateTime = new Date()

    return this
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
    if (item.expires && item.expires < new Date()) {
      return false
    }
    return true
  }

  /**
   * 验证 cookie 是否可持久化
   * @return {Boolean} 是否可持久化
   */
  isPersistence () {
    return item.maxAge ? item.maxAge > 0 : true
  }

  /**
   * 重写对象的 toString 方法
   */
  toString () {
    return [this.key, this.value].join('=')
  }
}

export default CookieStore
