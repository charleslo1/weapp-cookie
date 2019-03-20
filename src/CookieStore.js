import Cookie from './Cookie'
import cookieParser from 'set-cookie-parser'
import util from './util'
import api from './api'

/**
 * CookieStore 类
 */
class CookieStore {
  /**
   * 构造函数
   */
  constructor () {
    // storageKey
    this.__storageKey = '__cookie_store__'
    // cookies Map缓存（domain -> cookie 二级结构）
    this.__cookiesMap = this.__readFromStorage()
  }

  /**
   * 是否存在某个 cookie
   * @param  {String}  name       cookie 名称
   * @param  {String}  [domain]   指定域名（可选）
   * @param  {String}  [path]     指定path（可选）
   * @return {Boolean}            是否存在
   */
  has (name, domain, path) {
    // 返回是否存在 cookie 值
    return this.getCookie(name, domain, path) !== undefined
  }

  /**
   * 获取 cookie 值
   * @param {String} name       cookie 名称
   * @param {String} [domain]   指定域名（可选）
   * @param {String} [path]     指定path（可选）
   * @return {String}           cookie 值
   */
  get (name = '', domain = '', path = '/') {
    // 获取 cookie
    let cookie = this.getCookie(name, domain, path)

    // 返回 cookie 值
    return cookie ? cookie.value : undefined
  }

  /**
   * 设置域名 cookie
   * @param {String}  name              cookie 名称
   * @param {String}  value             cookie 值
   * @param {Object}  options           cookie 选项
   * @param {String}  options.domain
   * @param {String}  [options.path]
   * @param {Date}    [options.expires]
   * @param {Number}  [options.maxAge]
   * @param {Boolean} [options.httpOnly]
   * @return {Cookie}           cookie 对象
   */
  set (name = '', value = '', options = {}) {
    // 构建 Cookie 实例
    let domain = options.domain
    if (!domain || !name) throw new Error('name 和 options.domain 值不正确！')

    let cookie = new Cookie(Object.assign(options, {
      name: name,
      value: value
    }))

    // 设置到指定域名
    let cookies = this.__cookiesMap.get(domain) || new Map()
    cookies.set(name, cookie)
    this.__cookiesMap.set(domain, cookies)

    // 保存到 Storage
    this.__saveToStorage()

    return cookie
  }

  /**
   * 获取所有域名和 cookies 结构
   * @return {Object}  obj  结构JSON对象
   */
  dir () {
    let dirObj = { }

    for (let domain of this.__cookiesMap.keys()) {
      dirObj[domain] = this.getCookies(domain)
    }

    return dirObj
  }

  /**
   * 删除 cookie
   * @param  {Array}  name      cookie 键
   * @param  {String} [domain]  指定域名（可选）
   * @return {Boolean}          是否删除成功
   */
  remove (name = '', domain = '') {
    if (domain) {
      // 删除指定域名的 cookie
      let cookies = this.__cookiesMap.get(domain)
      cookies && cookies.delete(name)
    } else {
      // 删除所有域名的 cookie
      for (let cookies of this.__cookiesMap.values()) {
        cookies.delete(name)
      }
    }

    // 保存到 Storage
    this.__saveToStorage()

    return true
  }

  /**
   * 获取 cookie 对象
   * @param {String} name       cookie 名称
   * @param {String} [domain]   指定域名（可选）
   * @param {String} [path]     指定path（可选）
   * @return {Cookie}           cookie 对象
   */
  getCookie (name = '', domain = '', path = '/') {
    let cookie

    // 获取 cookie scope 域名数组
    let scopeDomains = util.getCookieScopeDomain(domain)

    // 获取任意域名的 cookie
    for (let [key, cookies] of this.__cookiesMap.entries()) {
      // 如果有域名，则根据域名过滤
      if (domain && scopeDomains.indexOf(key) < 0) continue
      // 获取 cookie
      cookie = cookies.get(name)
      if (cookie && cookie.isInPath(path) && !cookie.isExpired()) break
      cookie = undefined
    }

    // 返回 cookie 值
    return cookie
  }

  /**
   * 获取 cookies key/value 对象
   * @param  {String} [domain]  指定域名（可选）
   * @return {Object}           cookie 值列表对象
   */
  getCookies (domain, path) {
    let cookieValues = { }

    // 将 cookie 值添加到对象
    this.getCookiesArray(domain, path).forEach((cookie) => {
      cookieValues[cookie.name] = cookie.value
    })

    // 返回获取的 cookie 值对象
    return cookieValues
  }

  /**
   * 获取 cookies 对象数组
   * @param  {String} [domain]  指定域名（可选）
   * @return {Array}            Cookie 对象数组
   */
  getCookiesArray (domain = '', path = '/') {
    let cookiesArr = []

    // 获取 cookie scope 域名数组
    let scopeDomains = util.getCookieScopeDomain(domain)

    // 获取任意域名的 cookie
    for (let [key, cookies] of this.__cookiesMap.entries()) {
      // 如果有域名，则根据域名过滤
      if (domain && scopeDomains.indexOf(key) < 0) continue
      // 循环当前域名下所有 cookie
      for (let cookie of cookies.values()) {
        // 筛选符合 path 条件并且未过期的 cookie
        if (cookie.isInPath(path) && !cookie.isExpired()) {
          cookiesArr.push(cookie)
        }
      }
    }

    // 返回获取的 cookie 值对象
    return cookiesArr
  }

  /**
   * 设置 cookies 对象数组到 store
   * @param  {Array} cookies  Cookie 对象数组
   * @return {Map}            cookies Map 对象
   */
  setCookiesArray (cookies = []) {
    this.__cookiesMap = this.__cookiesMap || new Map()

    // Cookie 数组转换 Map 对象
    cookies.forEach((cookie) => {
      let cookieMap = this.__cookiesMap.get(cookie.domain)
      if (!cookieMap) {
        cookieMap = new Map()
        this.__cookiesMap.set(cookie.domain, cookieMap)
      }
      cookieMap.set(cookie.name, cookie)
    })

    // 保存到 Storage
    this.__saveToStorage()

    return this.__cookiesMap
  }

  /**
   * 清除 cookies
   * @param  {String} [domain]  指定域名（可选）
   * @return {Boolean}          是否清除成功
   */
  clearCookies (domain) {
    if (domain) {
      let cookies = this.__cookiesMap.get(domain)
      cookies && cookies.clear()
    } else {
      this.__cookiesMap.clear()
    }

    // 保存到 Storage
    this.__saveToStorage()

    return true
  }

  /**
   * 获取 request cookies
   * @param  {String} domain 指定域名
   * @return {String}        request cookies 字符串
   */
  getRequestCookies (domain, path) {
    // cookies 数组
    let cookiesArr = this.getCookiesArray(domain, path)

    // 转化为 request cookies 字符串
    return this.stringify(cookiesArr)
  }

  /**
   * 设置 response cookies
   * @param {String} setCookieStr response set-cookie 字符串
   * @param {String} domain       默认域名（如果 set-cookie 中没有设置 domain 则使用该域名）
   */
  setResponseCookies (setCookieStr, domain) {
    // 转换为 cookie 对象数组
    let parsedCookies = this.parse(setCookieStr, domain)

    // 设置 cookies
    return this.setCookiesArray(parsedCookies)
  }

  /**
   * 解析 response set-cookie 字段
   * @param  {String} setCookieStr response set-cookie 字符串
   * @param  {String} domain       默认域名（如果 set-cookie 中没有设置 domain 则使用该域名）
   * @return {Array}               Cookie 对象数组
   */
  parse (setCookieStr = '', domain) {
    // parse
    var cookies = cookieParser.parse(cookieParser.splitCookiesString(setCookieStr))

    // 转换为 Cookie 对象
    return cookies.map((item) => {
      if (!item.domain) item.domain = domain
      return new Cookie(item)
    })
  }

  /**
   * 将 cookies 字符串化，转化为 request cookies 字符串
   * @param  {Array} cookies Cookie 对象数组
   * @return {String}        cookie 字符串
   */
  stringify (cookies) {
    return cookies.map((item) => item.toString()).join('; ')
  }

  /**
   * 将 cookies 保存到 Storage
   */
  __saveToStorage () {
    let saveCookies = []

    // 获取需要持久化的 cookie
    for (let cookies of this.__cookiesMap.values()) {
      for (let cookie of cookies.values()) {
        if (cookie.isExpired()) {
          // 清除无效 cookie
          cookies.delete(cookie.name)
        } else if (cookie.isPersistence()) {
          // 只存储可持久化 cookie
          saveCookies.push(cookie)
        }
      }
    }

    // 保存到本地存储
    api.setStorageSync(this.__storageKey, saveCookies)
  }

  /**
   * 从 Storage 读取 cookies
   */
  __readFromStorage () {
    // 从本地存储读取 cookie 数据数组
    let cookies = api.getStorageSync(this.__storageKey) || []

    // 转化为 Cookie 对象数组
    cookies = cookies.map((item) => new Cookie(item))

    // 转化为 cookie map 对象
    return this.setCookiesArray(cookies)
  }
}

export default CookieStore
