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
    // 数据类型
    options.dataType = options.dataType || 'json'
    options.header = options.headers = options.header || options.headers || {}
    options.header['X-Requested-With'] = 'XMLHttpRequest'
    if (options.dataType === 'json') {
      options.header['Accept'] = 'application/json, text/plain, */*'
    }

    // 判断在小程序环境是否启用 cookie
    if (api.platform !== 'h5' && options.cookie) {
      // 域名
      let domain = (options.url || '').split('/')[2]
      let path = options.url.split(domain).pop()

      // 获取请求 cookies
      let requestCookies = cookieStore.getRequestCookies(domain, path)

      // 请求时带上设置的 cookies
      options.header['Cookie'] = requestCookies

      // 请求成功回调
      let successCallback = options.success
      options.success = function (response) {
        response.header = response.header || response.headers
        // 获取响应 cookies
        let responseCookies = response.header ? response.header['Set-Cookie'] || response.header['set-cookie'] : ''
        if (responseCookies) {
          // 处理QQ小程序下cookie分隔符问题：https://github.com/charleslo1/weapp-cookie/issues/39
          responseCookies = responseCookies.replace(/\;([^\s\;]*?(?=\=))/ig, ',$1')
          // 设置 cookies，以便下次请求带上
          cookieStore.setResponseCookies(responseCookies, domain)
        }
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
    // 增加 requestWithCookie、uploadFileWithCookie、downloadFileWithCookie 接口
    Object.defineProperties(api, {
      // request
      requestWithCookie: {
        value: requestProxy
      },
      // uploadFile
      uploadFileWithCookie: {
        value: uploadFileProxy
      },
      // downloadFile
      downloadFileWithCookie: {
        value: downloadFileProxy
      }
    })

    // 使用 requestProxy 覆盖微信原生 request、uploadFile、downloadFile 接口
    Object.defineProperties(api, {
      // request
      request: {
        value: requestProxy
      },
      // uploadFile
      uploadFile: {
        value: uploadFileProxy
      },
      // downloadFile
      downloadFile: {
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
