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
    // 获取符合条件的 cookie
    let filterCookies = this.cookies.filter((item) => {
      if (item.domain !== domain) return false
      return item.validate()
    })

    // 转化为 request cookies 字符串
    return this.stringify(filterCookies)
  }

  /**
   * 设置 cookies
   */
  setCookies(domain, cookieStr) {
    // 转换为 cookie 对象数组
    let parsedCookies = this.parse(domain, cookieStr)

    // 删除旧的同名 cookie
    let keys = parsedCookies.map((item) => item.key)
    this.removeCookies(domain, keys)

    // 设置新 cookie
    this.cookies = this.cookies.concat(parsedCookies)

    // 保存到本地存储
    this.saveToStorage()
  }

  /**
   * 删除 cookies
   * @param  {String} domain 域名
   * @param  {Array} keys   cookie 键列表
   */
  removeCookies(domain, keys) {
    // 删除 cookies
    this.cookies = this.cookies.filter((item) => {
      return !(item.domain === domain && keys.indexOf(item.key) >= 0)
    })
  }

  /**
   * 将 cookies 保存到 Storage
   */
  saveToStorage() {
    // 清除无效 cookie
    this.cookies = this.cookies.filter((item) => {
      return item.validate()
    })

    // 只存储可持久化 cookie
    let saveCookies = this.cookies.filter((item) => {
      return item.isPersistence()
    })

    // 保存到本地存储
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
   * 解析 response set-cookie 字段
   */
  parse(domain, setCookieStr = '') {
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

  /**
   * 将 cookies 字符串化，转化为 request cookies 字符串
   * @param  {Array} cookies cookie对象数组
   * @return {String}        cookie字符串
   */
  stringify (cookies) {
    return cookies.map((item) => item.toString()).join('; ')
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
    return [this.key, this.value].join('=')
  }
}

export default CookieStore
