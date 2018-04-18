import Cookie from './Cookie'

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
  getCookies (domain) {
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
  setCookies (domain, cookieStr) {
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
  removeCookies (domain, keys) {
    // 删除 cookies
    this.cookies = this.cookies.filter((item) => {
      return !(item.domain === domain && keys.indexOf(item.key) >= 0)
    })
  }

  /**
   * 将 cookies 保存到 Storage
   */
  saveToStorage () {
    // 清除无效 cookie
    this.cookies = this.cookies.filter((item) => item.validate())

    // 只存储可持久化 cookie
    let saveCookies = this.cookies.filter((item) => item.isPersistence())

    // 保存到本地存储
    wx.setStorageSync(this.storageKey, saveCookies)
  }

  /**
   * 从 Storage 读取 cookies
   */
  readFromStorage () {
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
  parse (domain, setCookieStr = '') {
    // 切分 cookies
    let cookies = setCookieStr.split(',')
    let fixCookies = []

    // 修复被切分的 cookies
    cookies.forEach((item) => {
      if ((/^\S+\=/ig).test(item)) {
        fixCookies.push(item)
      } else {
        let lastIndex = fixCookies.length - 1
        if (lastIndex < 0) return
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

export default CookieStore
