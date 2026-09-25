/**
 * 类型声明的用例，仅用于 `npx tsc --noEmit` 校验，不参与 mocha 测试
 * 参考：https://github.com/charleslo1/weapp-cookie/issues/40
 */
import cookies, { Cookie, CookieStore } from '../../index'

// 小程序的宿主对象，由运行环境提供
declare const wx: any

// 读取 / 判断 / 设置 / 删除
const token: string | undefined = cookies.get('csrf_token', 'example.com')
const exists: boolean = cookies.has('csrf_token', 'example.com')
const created: Cookie = cookies.set('uid', '100', {
  domain: 'example.com',
  path: '/',
  maxAge: 3600,
  httpOnly: true,
  expires: new Date()
})
const removed: boolean = cookies.remove('uid', 'example.com')
const all: Cookie[] = cookies.getCookiesArray('example.com')
const dir: { [domain: string]: { [key: string]: string } } = cookies.dir()
const requestCookies: string = cookies.getRequestCookies('example.com', '/')

// Cookie 对象
const cookie: Cookie | undefined = cookies.getCookie('uid', 'example.com')
const expired: boolean | undefined = cookie && cookie.isExpired()
const persistence: boolean | undefined = cookie && cookie.isPersistence()
const asString: string | undefined = cookie && cookie.toString()

// 配置与安装
const store: CookieStore = cookies.config({
  requestAlias: 'requestWithCookie',
  override: false,
  alipayEnableCookie: false
})
const aliasFailed: string[] = cookies.install().aliasFailed
const overrideFailed: string[] = cookies.install().overrideFailed

// 时间校准
const now: Date = cookies.setNowTime('Sun, 04 Jun 2023 11:12:09 GMT')
const nowDate: Date = cookies.now()

// 请求
wx.request({
  url: 'https://example.com/api',
  cookie: true,
  success: () => {}
})

export { token, exists, created, removed, all, dir, requestCookies, expired, persistence, asString, store, aliasFailed, overrideFailed, now, nowDate }
