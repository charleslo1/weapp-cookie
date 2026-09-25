# 回归测试规范

提交前按下面的顺序跑一遍。前三步是对外发布的最低要求，第四步起是本次修复涉及的场景。

## 1. 单元测试

``` sh
npm test
```

`test/weapp-cookie.test.js` 覆盖 Cookie / CookieStore 的基本行为与历史回归；`test/host-env.test.js`
会在独立进程里跑 `test/fixtures/` 下的环境用例（宿主对象在模块加载时确定，同一个进程无法反复模拟）；
`test/types.test.js` 校验类型声明与运行时 API 一致。

## 2. 构建与 dist 一致性

`dist/` 是随 npm 包一起发布的产物，源码改完必须重建，否则用户拿到的仍是旧代码
（历史上 #69 / #54 就是因为只改了 `src/` 没有重建 `dist/` 才一直没生效）。

``` sh
npm run build:rollup   # gulp 3 无法在 Node 12+ 上运行，用这个命令重建 dist
git diff --stat dist/  # 只有源码变更才应该出现 diff
npm test               # 测试跑的是 dist，改完源码必须重新跑一遍
```

## 3. 代码规范与类型

``` sh
npx eslint src/*.js index.js build/rollup-build.js
npx -y -p typescript@5 tsc --noEmit --strict --target es2015 --moduleResolution node --lib es2015,dom test/types/usage.ts
```

## 4. 本次修复的场景回归

| Issue | 场景 | 自动化用例 |
| --- | --- | --- |
| #69 / #54 / #53 | iOS 上 `Set-Cookie` 为数组 / 一个响应多个 `Set-Cookie` | `test/weapp-cookie.test.js` → `response with multiple set-cookie` |
| #70 | `Expires` 为 RFC 1123 时不触发 `new Date` 警告 | `test/host-env.test.js` → `#70 ...`，`weapp-cookies.js Expires 解析` |
| #56 | `Max-Age:0` / 负数立即过期 | `test/weapp-cookie.test.js` → `set-cookie Max-Age:0` |
| #43 | 域名带端口号时的作用域与域名标准化 | `test/util.test.js` + `test/weapp-cookie.test.js` → `域名带端口号` / `wx.request 代理` |
| #34 | 插件环境不允许覆盖宿主方法 | `test/host-env.test.js` → `#34 ...`（`test/fixtures/plugin-host.js`） |
| #58 | 宿主对象晚于本库出现 | `test/host-env.test.js` → `#58 ...`（`test/fixtures/late-host.js`） |
| #62 | 支付宝小程序 `enableCookie` | `test/host-env.test.js` → `#62 ...`（`test/fixtures/alipay-enable-cookie.js`） |
| #67 | 设备时间被改动后的过期判断 | `test/weapp-cookie.test.js` → `weapp-cookies.js 时间校准` |
| #40 | TypeScript 类型声明 | `test/types.test.js` + `test/types/usage.ts` 的 tsc 检查 |
| #48 | domain 存储格式变化的升级说明 | `CHANGELOG.md` 的「升级注意事项」（文档，无自动化用例） |

## 5. 自动化覆盖不到的场景

以下场景需要真机 / 真环境确认，提 PR 时请在描述里注明是否验证过：

1. **iOS 真机**：`wx.request` / `uni.uploadFile` / `wx.downloadFile` 收到数组形式的 `Set-Cookie` 不再抛
   `responseCookies.replace is not a function`，且后续请求带上 cookie（#69 / #54）。
2. **uni-app APP 端**：`uni` 晚于本库出现时执行 `cookies.config({ host: uni })` 后，
   `uni.request` 已带上 cookie；清除 cookie 后请求不再携带（#58 / #42 / #23）。
3. **小程序插件环境**：引入后控制台只有一条 warn、没有 error，改用 `wx.requestWithCookie` 可正常带上 cookie（#34）。
4. **支付宝小程序**：默认 `enableCookie === false`，登录态由本库维护，不影响宿主 `my.request` 的其它参数（#62）。
5. **升级路径**：从 1.4.6 及更早版本升级的开发者工具里，需要按 CHANGELOG 的说明调用一次
   `cookies.clearCookies()` 清掉旧的 domain 存储（#48）。
