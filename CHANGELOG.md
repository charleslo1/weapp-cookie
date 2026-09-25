# 更新日志

## 1.4.9

本版本集中修复了 iOS /支付宝 小程序上 `Set-Cookie` 相关的崩溃与刷屏问题，并补齐了若干长期挂起的兼容性、类型与文档问题。

### 修复

- **iOS 真机崩溃：`responseCookies.replace is not a function`**（#69、#54、#53）
  `dist/` 与 npm 包在过去几年里停留在旧代码：源码中已修好的「`Set-Cookie` 是数组」兼容处理没有重新构建发布，所有 npm 用户与复制 `dist/` 文件的用户拿到的仍是崩溃版本。本版本重新构建 `dist/` 并发布。
- **控制台刷屏：`new Date("Mon, 01 Dec 2025 09:48:36 GMT")` 在部分 iOS 下无法正常使用**（#70）
  set-cookie 的 `Expires` 属性是 RFC 1123 格式，uni-app 与部分 iOS 真机在用它构造 `new Date` 时会打印警告。现在会把 `Expires` 归一化成 ISO 8601（`2025-12-01T09:48:36+00:00`）后再解析，警告消失，过期时间与之前完全一致。
- **`max-age:0` 不生效**（#56）
  补回 `Cookie` 中 `maxAge` 的判断，`Set-Cookie: xxx=; Max-Age=0` 现在会真正清除 cookie（负数同样按 RFC 6265 立即过期）。
- **域名带端口号时作用域判断错误**（#43）
  `getCookieScopeDomain` / `normalizeDomain` 会先剥离端口号。
- **一个响应返回多个 `Set-Cookie` 时解析不正确**（#53）
  改用 `splitCookiesString` 拆分，去掉会误伤其它 cookie 指令的历史正则。

### 新增

- **宿主对象不允许被覆盖时的降级处理**（#34）：小程序插件环境下不再打印 error，只注册别名并给出一条 `warn` 提示；可用 `cookies.config({ override: false })` 显式关闭覆盖。
- **宿主对象晚于本库出现时的安装方式**（#58）：`cookies.config({ host: uni })`，适用于 uni-app APP 端在入口文件引入本库时 `uni` 尚未挂载的情况。
- **支付宝小程序 `enableCookie`**（#62）：`my.request` 的 `enableCookie` 默认置为 `false`，由本库接管 cookie；需要宿主接管时可传 `enableCookie: true` 或 `cookies.config({ alipayEnableCookie: true })`。
- **手动校准时间**（#67）：`cookies.setNowTime(Date|Number|String)`。设备时间被用户改动后，可以以服务端时间为准判断 cookie 是否过期，`cookies.setNowTime()` 不传参数则恢复使用设备时间。
- **TypeScript 类型声明**（#40）：新增 `index.d.ts` 与 `types` 字段。
- **不依赖 gulp 的构建命令** `npm run build:rollup`（gulp 3 无法在 Node 12+ 上运行）。

### 升级注意事项

#### 1. cookie 存储的 domain 格式变化（#48）

从加入 RFC 6265 域名标准化（`normalizeDomain`）的版本起，cookie 的 domain 统一存成带前导点的形式（`example.com` → `.example.com`）。

- 旧版本的 Storage 里存的是不带点的原值，新版本读不到，表现是「登录态丢失 / 登录失败」；
- 微信开发者工具的「线上版本 → 开发版本」会复制 Storage，因此从很老的版本升级到本版本时更容易遇到，且不易复现。

迁移方式：

``` js
import cookies from 'weapp-cookie'

// 升级后清理一次旧的 cookie 存储，让用户重新登录一次
cookies.clearCookies()
```

需要在线上与开发环境之间做数据隔离时，建议在各自环境分别调用 `cookies.clearCookies()`，或自行在 Storage 里维护隔离标记。

#### 2. 插件环境与 uni-app APP 端

小程序插件环境下 `wx.request` 不允许被重写，这是宿主的限制。此时本库只注册别名，请改用 `wx.requestWithCookie(...)`；uni-app APP 端如果在入口文件引入本库时 `uni` 还不存在，请在 `uni` 就绪后再执行一次 `cookies.config({ host: uni })`。详见 README「插件与 uni-app 环境」。

## 1.4.6 及更早

历史版本未维护更新日志。此前的修复包括：domain 作用域标准化、`Set-Cookie` 数组兼容（`src` 层，随本版本才真正发布）、依赖安全升级等。
