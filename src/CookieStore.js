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
   * 获取 Cookies
   */
  getCookies(domain) {
    let filterCookies = this.cookies.filter((item) => {
      if (item.domain != domain) return false
      if (item.expires && item.expires < new Date()) return false
      return true
    })

    return filterCookies.map((item) => item.toString()).join('; ')
  }

  /**
   * 设置 Cookies
   */
  setCookies(domain, cookieStr) {
    let parsedCookies = this.parseCookies(domain, cookieStr)
    this.cookies = this.cookies.concat(parsedCookies)
    this.saveToStorage()
  }

  /**
   * 保存到 Storage
   */
  saveToStorage() {
    wx.setStorageSync(this.storageKey, this.cookies)
  }

  /**
   * 从 Storage 读取
   */
  readFromStorage() {
    let cookies = wx.getStorageSync(this.storageKey) || []
    this.cookies = cookies.map((item) => new Cookie(item))
    return this.cookies
  }

  /**
   * 添加 Cookies
   */
  clearCookies (domain) {
    this.cookies = []
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
    this.maxAge = obj.maxAge ? parseInt(obj.maxAge) : 0
    this.httpOnly = !!obj.httpOnly
  }

  /**
   * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
   */
  set(setCookieStr = '') {
    let arr = setCookieStr.split(/\s*\;\s*/g)

    arr.forEach((item, i) => {
      let temp = item.split('=')
      if (i === 0) {
        this.key = temp[0]
        this.value = temp[1]
      } else {
        let prop = temp[0]
        prop = prop.replace(/-/g, '').replace(/^(\S)/g, (prop[0] || '').toLowerCase())

        switch (prop) {
          case 'maxAge':
            this.maxAge = parseInt(temp[1])
            break
          case 'expires':
            this.expires = new Date(temp[1])
            break
          case 'httpOnly':
            this.httpOnly = true
            break
          default:
            this[prop] = temp[1]
            break
        }
      }
    })

    return this
  }

  /**
   * 重写对象的 toString 方法
   */
  toString () {
    return [this.key, this.value].join('=')
  }
}

export default CookieStore
