/**
 * weapp-cookie 类型声明
 * 参考：https://github.com/charleslo1/weapp-cookie/issues/40
 */

/** 设置 cookie 的选项 */
export interface CookieOptions {
  /** 作用域名（必填） */
  domain: string
  /** 作用路径，默认 '/' */
  path?: string
  /** 过期时间 */
  expires?: Date | string | number
  /** 存活秒数 */
  maxAge?: number
  /** 是否只允许服务端访问 */
  httpOnly?: boolean
}

/** 请求参数，与小程序 request 参数一致 */
export interface CookieRequestOptions {
  url: string
  data?: any
  header?: { [key: string]: any }
  headers?: { [key: string]: any }
  method?: string
  dataType?: string
  /** 是否携带 cookie，默认 true */
  cookie?: boolean
  /** 支付宝小程序：是否使用宿主自带的 cookie 机制，默认 false（由本库接管） */
  enableCookie?: boolean
  success?: (res: any) => void
  fail?: (err: any) => void
  complete?: (res: any) => void
  [key: string]: any
}

/** config 的可配置项 */
export interface CookieConfig {
  /** 请求别名，默认 'requestWithCookie'，传空字符串表示不注册 */
  requestAlias?: string
  /** uploadFile 别名，默认 'uploadFileWithCookie' */
  uploadFileAlias?: string
  /** downloadFile 别名，默认 'downloadFileWithCookie' */
  downloadFileAlias?: string
  /** 是否覆盖宿主原生的 request / uploadFile / downloadFile，默认 true */
  override?: boolean
  /** 宿主对象；宿主晚于本库出现时（uni-app APP 端）用它完成安装 */
  host?: any
  /** 支付宝小程序：是否使用宿主自带的 cookie 机制，默认 false */
  alipayEnableCookie?: boolean
}

/** 安装结果 */
export interface CookieInstallResult {
  /** 注册失败的别名 */
  aliasFailed: string[]
  /** 覆盖失败的宿主方法 */
  overrideFailed: string[]
}

/** cookie 对象 */
export declare class Cookie {
  name: string
  value: string
  domain: string
  path: string
  expires: Date | null
  maxAge: number | null
  httpOnly: boolean
  dateTime: Date
  /** 是否已过期 */
  isExpired (): boolean
  /** 是否可持久化 */
  isPersistence (): boolean
  /** 是否在指定域名范围内 */
  isInDomain (domain: string): boolean
  /** 是否在指定 path 范围内 */
  isInPath (path: string): boolean
  toString (): string
}

/** CookieStore 实例 */
export declare class CookieStore {
  /**
   * 获取 cookie 值
   * @param name   cookie 名称
   * @param domain 指定域名（可选）
   * @param path   指定 path（可选）
   */
  get (name: string, domain?: string, path?: string): string | undefined
  /**
   * 设置 cookie
   * @param name    cookie 名称
   * @param value   cookie 值
   * @param options cookie 选项
   */
  set (name: string, value?: string, options?: CookieOptions): Cookie
  /** 判断是否存在某个 cookie */
  has (name: string, domain?: string, path?: string): boolean
  /** 删除 cookie */
  remove (name: string, domain?: string): boolean
  /** 获取 cookie 对象 */
  getCookie (name: string, domain?: string, path?: string): Cookie | undefined
  /** 获取 key/value 形式的 cookie 对象 */
  getCookies (domain?: string, path?: string): { [key: string]: string }
  /** 获取 Cookie 对象数组 */
  getCookiesArray (domain?: string, path?: string): Cookie[]
  /** 设置 cookies 数组 */
  setCookiesArray (cookies?: Cookie[]): Map<string, Map<string, Cookie>>
  /** 获取所有域名与 cookies 的结构 */
  dir (): { [domain: string]: { [key: string]: string } }
  /** 清除 cookie */
  clearCookies (domain?: string): boolean
  /** 获取 request cookies 字符串 */
  getRequestCookies (domain?: string, path?: string): string
  /** 设置 response cookies */
  setResponseCookies (setCookieStr: string | string[], domain?: string): Map<string, Map<string, Cookie>>
  /** 解析 set-cookie */
  parse (setCookieStr?: string | string[], domain?: string): Cookie[]
  /** 将 cookies 转换为 request cookies 字符串 */
  stringify (cookies: Cookie[]): string
  /**
   * 配置
   * @param options 配置项
   */
  config (options?: CookieConfig): CookieStore
  /**
   * 手动把代理安装到指定宿主对象
   * @param host 宿主对象
   */
  install (host?: any): CookieInstallResult
  /**
   * 校准时间基准，设备时间被修改后可以以服务端时间为准判断 cookie 是否过期
   * @param nowTime 当前真实时间，缺省则恢复为设备时间
   */
  setNowTime (nowTime?: Date | number | string): Date
  /** 获取当前时间（已校准） */
  now (): Date
}

declare const cookies: CookieStore

export default cookies
