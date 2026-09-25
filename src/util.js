/**
 * Util 类
 */

/**
 * 常用的月份缩写，用于解析 RFC 1123 格式的日期字符串
 */
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/**
 * RFC 1123 日期（set-cookie 的 Expires 属性），兼容以下写法：
 *   Sun, 06 Nov 1994 08:49:37 GMT
 *   Sun, 06-Nov-94 08:49:37 GMT
 *   Sun Nov  6 08:49:37 1994
 * 参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date
 */
const RFC1123_DATE = /^(?:[a-z]{3},?\s+)?(\d{1,2})[-\s]+([a-z]{3})[-\s]+(\d{2,4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(gmt|utc|z|([+-])(\d{2}):?(\d{2}))?$/i

class Util {
  /**
   * 补齐两位数字
   * @param  {Number} num 数字
   * @return {String}     两位字符串
   */
  pad (num) {
    return num < 10 ? '0' + num : '' + num
  }

  /**
   * 解析 RFC 1123 格式的日期字符串，返回时间戳（毫秒）
   *
   * 不使用 Date.parse / new Date(字符串)：在 uni-app 与部分 iOS 真机上，
   * new Date('Mon, 01 Dec 2025 09:48:36 GMT') 这样的调用会被判定为「不支持的格式」
   * 而打印控制台警告（见 #70），所以这里自行解析。
   * @param  {String} dateStr 日期字符串
   * @return {Number|null}    时间戳，无法解析时返回 null
   */
  parseDate (dateStr = '') {
    let matched = String(dateStr).trim().match(RFC1123_DATE)
    if (!matched) return null

    let month = MONTHS.indexOf(matched[2].toLowerCase())
    if (month < 0) return null

    // 两位年份按 RFC 6265 约定补全
    let year = parseInt(matched[3], 10)
    if (year < 100) year += year >= 70 ? 1900 : 2000

    let time = Date.UTC(
      year,
      month,
      parseInt(matched[1], 10),
      parseInt(matched[4], 10),
      parseInt(matched[5], 10),
      parseInt(matched[6], 10)
    )

    // 时区偏移（默认 GMT）
    if (matched[8]) {
      let offset = (parseInt(matched[9], 10) * 60 + parseInt(matched[10], 10)) * 60 * 1000
      time += matched[8] === '-' ? offset : -offset
    }

    return isNaN(time) ? null : time
  }

  /**
   * 把任意日期字符串归一化成 iOS / uni-app 都支持的 ISO 8601 格式
   * @param  {String} dateStr 日期字符串
   * @return {String}         归一化后的日期字符串，无法解析时原样返回
   */
  normalizeDate (dateStr = '') {
    let time = this.parseDate(dateStr)
    if (time === null) return dateStr

    let date = new Date(time)
    return [
      date.getUTCFullYear(),
      this.pad(date.getUTCMonth() + 1),
      this.pad(date.getUTCDate())
    ].join('-') + 'T' + [
      this.pad(date.getUTCHours()),
      this.pad(date.getUTCMinutes()),
      this.pad(date.getUTCSeconds())
    ].join(':') + '+00:00'
  }

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

  /**
   * 根据最新的 RFC 6265 标准化域名作用域
   * @param  {String} domain 域名
   * @return {String}        标准化后的域名
   */
  normalizeDomain (domain = '') {
    return domain.replace(/^(\.*)?(?=\S)/ig, '.')
  }
}

export default new Util()
