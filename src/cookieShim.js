import CookieStore from './CookieStore'
import api from './api'

/**
 * 微信 Cookie 代理
 */
const cookieStore = (function () {
  // 创建 cookieStore 实例
  const cookieStore = new CookieStore()

  /**
   * 定义请求 cookie 代理函数
   * @param  {Object} options 请求参数
   */
  function cookieRequestProxy (options) {
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
        let responseCookies = response.header ? response.header['Set-Cookie'] || response.header['set-cookie'] : ''
        // 设置 cookies，以便下次请求带上
        if (responseCookies) cookieStore.setResponseCookies(responseCookies, domain)
        // 调用成功回调函数
        successCallback && successCallback(response)
      }
    }

    // 发送网络请求
    return this(options)
  }

  // 绑定新的
  const requestProxy = cookieRequestProxy.bind(api.request)
  const uploadFileProxy = cookieRequestProxy.bind(api.uploadFile)
  const downloadFileProxy = cookieRequestProxy.bind(api.downloadFile)

  try {
    // 使用 requestProxy 覆盖微信原生 request、uploadFile
    Object.defineProperties(api, {
      // request
      request: {
        value: requestProxy
      },
      requestWithCookie: {
        value: requestProxy
      },
      // uploadFile
      uploadFile: {
        value: uploadFileProxy
      },
      uploadFileWithCookie: {
        value: uploadFileProxy
      },
      // downloadFile
      downloadFile: {
        value: downloadFileProxy
      },
      downloadFileWithCookie: {
        value: downloadFileProxy
      }
    })
  } catch (err) {
    console.error('weapp-cookie: ', err)
  }

  // 配置
  cookieStore.config = function (options) {
    options = Object.assign({
      requestAlias: 'requestWithCookie',
      uploadFileAlias: 'uploadFileWithCookie',
      downloadFileAlias: 'downloadFileWithCookie'
    }, options)
    // 配置请求别名
    if (options.requestAlias) {
      Object.defineProperty(api, options.requestAlias, { value: requestProxy })
    }
    if (options.uploadFileAlias) {
      Object.defineProperty(api, options.uploadFileAlias, { value: uploadFileProxy })
    }
    if (options.downloadFileAlias) {
      Object.defineProperty(api, options.downloadFileAlias, { value: downloadFileProxy })
    }
  }

  // 返回 cookieStore
  return cookieStore
})()

// 导出 cookieStore 实例
export default cookieStore
