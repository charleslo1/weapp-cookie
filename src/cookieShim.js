import CookieStore from './CookieStore'

/**
 * 微信 Cookie 代理
 * @param  {Object} wx      微信 API 对象
 * @param  {Object} request 微信请求函数
 */
const cookieStore = (function (wx, request) {
  // 创建 cookieStore 实例
  const cookieStore = new CookieStore()

  /**
   * 定义请求代理函数
   * @param  {Object} options 请求参数
   */
  function requestProxy (options) {
    // 是否启用 cookie（默认 true）
    options.cookie = options.cookie === undefined || !!options.cookie
    options.dataType = options.dataType || 'json'
    if (options.cookie) {
      // 域名
      let domain = (options.url || '').split('/')[2]
      let path = options.url.split(domain).pop()

      // 获取请求 cookies
      let requestCookies = cookieStore.getRequestCookies(domain, path)

      // 请求时带上设置的 cookies
      options.header = options.header || {}
      options.header['Cookie'] = requestCookies
      options.header['X-Requested-With'] = 'XMLHttpRequest'
      if (options.dataType === 'json') {
        options.header['Accept'] = 'application/json, text/plain, */*'
      }

      // 请求成功回调
      let successCallback = options.success
      options.success = function (response) {
        // 获取响应 cookies
        let responseCookies = response.header['Set-Cookie'] || response.header['set-cookie'] || ''
        // 设置 cookies，以便下次请求带上
        cookieStore.setResponseCookies(responseCookies, domain)
        successCallback && successCallback(response)
      }
    }

    // 发送网络请求
    request(options)
  }

  // 使用 requestProxy 覆盖微信原生 request
  Object.defineProperties(wx, {
    request: {
      value: requestProxy
    }
  })

  // 返回 cookieStore
  return cookieStore
})(wx, wx.request)

// 导出 cookieStore 实例
export default cookieStore
