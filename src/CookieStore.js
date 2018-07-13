import Cookie from './Cookie'
import cookieParser from 'set-cookie-parser'

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
    let keys = parsedCookies.map((item) => item.name)
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
      return !(item.domain === domain && keys.indexOf(item.name) >= 0)
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
    // parse
    var cookies = cookieParser.parse(cookieParser.splitCookiesString(setCookieStr))

    // 转换为 Cookie 对象
    return cookies.map((item) => {
      item.domain = domain
      return new Cookie(item)
    })
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
