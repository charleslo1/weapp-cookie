import CookieStore from './CookieStore'
import api, { detectPlatform } from './api'
import { setHost } from './host'

/**
 * 微信 Cookie 代理
 */
const cookieStore = (function () {
  // 创建 cookieStore 实例
  const cookieStore = new CookieStore()

  // 当前宿主对象（默认在加载时自动识别）
  let host = api
  // 宿主对象上被覆盖的原生方法，便于按配置恢复
  let originals = {}

  // 配置
  const config = {
    requestAlias: 'requestWithCookie',
    uploadFileAlias: 'uploadFileWithCookie',
    downloadFileAlias: 'downloadFileWithCookie',
    // 是否覆盖宿主原生的 request / uploadFile / downloadFile
    override: true,
    // 支付宝小程序：宿主自身也支持 cookie（my.request 的 enableCookie），
    // 与本库用 Storage 模拟的 cookie jar 叠加会出现重复或互相干扰，默认由本库接管
    alipayEnableCookie: false
  }

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

    // 支付宝小程序的宿主 cookie 机制交由使用者显式选择，避免与本库的 cookie jar 冲突
    if (host.platform === 'my' && options.enableCookie === undefined) {
      options.enableCookie = config.alipayEnableCookie
    }

    // 判断在小程序环境是否启用 cookie
    if (host.platform !== 'h5' && options.cookie) {
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
          // 设置 cookies，以便下次请求带上（set-cookie 可能是字符串，也可能是数组，
          // 分隔符兼容处理统一在 CookieStore 中完成）
          cookieStore.setResponseCookies(responseCookies, domain)
        }
        // 调用成功回调函数
        successCallback && successCallback(response)
      }
    }

    // 发送网络请求
    return this(options)
  }

  // 绑定当前宿主对象的方法，生成代理方法
  function getProxies () {
    return {
      request: cookieRequestProxy.bind(host.request),
      uploadFile: cookieRequestProxy.bind(host.uploadFile),
      downloadFile: cookieRequestProxy.bind(host.downloadFile)
    }
  }

  let proxies = getProxies()

  /**
   * 定义属性，宿主对象不允许定义时返回 false
   * @param  {Object} target 宿主对象
   * @param  {String} name   属性名
   * @param  {Any}    value  属性值
   * @return {Boolean}       是否定义成功
   */
  function defineProperty (target, name, value) {
    try {
      Object.defineProperty(target, name, { value: value })
      return true
    } catch (err) {
      return false
    }
  }

  /**
   * 把 cookie 代理安装到宿主对象上
   *
   * 小程序插件环境下原生方法不允许被覆盖，此时只注册别名并把原因说明清楚，
   * 不再像以前那样抛一条无法处理的错误（见 #34）；uni-app APP 端等
   * 「宿主对象出现得比库更晚」的环境，可以在宿主就绪后再次 install（见 #58）。
   * @param  {Object} [target] 宿主对象，缺省则使用当前宿主
   * @return {Object}          安装结果
   */
  function install (target) {
    if (target && target !== host) {
      host = target
      host.platform = host.platform || detectPlatform(host)
      setHost(host)
      proxies = getProxies()
      // 宿主对象变了，之前记录的原生方法不再适用
      originals = {}
    }

    // 增加 requestWithCookie、uploadFileWithCookie、downloadFileWithCookie 接口
    let aliasFailed = []
    let aliasMap = {
      [config.requestAlias]: proxies.request,
      [config.uploadFileAlias]: proxies.uploadFile,
      [config.downloadFileAlias]: proxies.downloadFile
    }
    for (let name of Object.keys(aliasMap)) {
      if (!name) continue
      if (!defineProperty(host, name, aliasMap[name])) aliasFailed.push(name)
    }

    // 覆盖宿主原生方法，失败不影响别名
    let overrideFailed = []
    let methodMap = {
      request: proxies.request,
      uploadFile: proxies.uploadFile,
      downloadFile: proxies.downloadFile
    }
    for (let name of Object.keys(methodMap)) {
      if (config.override) {
        if (typeof host[name] !== 'function') continue
        if (originals[name] === undefined) originals[name] = host[name]
        if (!defineProperty(host, name, methodMap[name])) overrideFailed.push(name)
      } else if (originals[name] !== undefined) {
        defineProperty(host, name, originals[name])
      }
    }

    if (overrideFailed.length) {
      console.warn('weapp-cookie: 当前环境不允许覆盖宿主方法 ' + overrideFailed.join('、') +
        '（小程序插件安全机制 / uni-app APP 端等），已跳过覆盖，请改用 ' +
        [config.requestAlias, config.uploadFileAlias, config.downloadFileAlias].join('、') +
        ' 发起请求，详见 README「插件与 uni-app 环境」')
    }
    if (aliasFailed.length) {
      console.warn('weapp-cookie: 无法在宿主对象上注册 ' + aliasFailed.join('、') +
        '，可尝试 cookies.config({ requestAlias: "..." }) 指定其它别名')
    }

    return { aliasFailed: aliasFailed, overrideFailed: overrideFailed }
  }

  // 配置
  cookieStore.config = function (options = {}) {
    let needInstall = false
    const aliasKeys = ['requestAlias', 'uploadFileAlias', 'downloadFileAlias']

    // 宿主对象：uni-app 等环境下 uni 对象可能晚于本库出现，可在就绪后再安装
    if (options.host) {
      install(options.host)
    }

    if (options.override !== undefined && options.override !== config.override) {
      config.override = !!options.override
      needInstall = true
    }
    if (options.alipayEnableCookie !== undefined) {
      config.alipayEnableCookie = !!options.alipayEnableCookie
    }

    // 配置请求别名
    aliasKeys.forEach((key) => {
      if (options[key] === undefined) return
      config[key] = options[key]
      needInstall = true
    })

    if (needInstall) install()

    return cookieStore
  }

  // 安装到开发时识别到的宿主对象上
  install()

  // 手动安装到指定宿主对象（同 cookies.config({ host })）
  cookieStore.install = function (target) {
    return install(target)
  }

  // 返回 cookieStore
  return cookieStore
})()

// 导出 cookieStore 实例
export default cookieStore
