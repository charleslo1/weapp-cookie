# weapp-cookie
> 一行代码让微信小程序支持 cookie

![weapp-cookie](./assets/weapp-cookie.png)

# Intro
微信原生的 wx.request 网络请求接口并不支持传统的 Cookie，但有时候我们现有的后端接口确于依赖 Cookie（比如服务器用户登录态），这个库可用一行代码为你的小程序实现 Cookie 机制，以保证基于 cookie 的服务会话不会失效，与 web 端共用会话机制

# Featrues
* 一行代码让小程序支持 cookie
* 可使用 api 获取、设置 cookie
* 支持跨子域 cookie


# Install

``` sh
npm install weapp-cookie --save

# 将 npm 包复制到 vendor 文件夹，避免小程序可能不能找到文件（tips：使用 wepy/mpvue 等框架无需此步）
cp -rf ./node_modules/ ./vendor/
```

# Usage

在小程序根目录的 app.js 一行代码引入即可

``` js
// app.js
import './vendor/weapp-cookie/index'

// tips: 使用 wepy/mpvue 可以直接在入口 js 引入 weapp-cookie 模块
// import 'weapp-cookie'

App({
    onLaunch: function () { }
    // ...
})
```

原来的 wx.request 调用方式保持不变，引入后 weapp-cookie 会在底层自动代理 wx.request 的接口访问，以支持 cookie 存储和发送

``` js
// pages/home/index.js

Page({
    onLoad: function () {
        wx.request({
            url: 'https://example.com/login',
            data: {
                username: 'admin',
                password: '123456'
            },
            success: function (res) {
                /*
                 * 接口调用成功后 weapp-cookie 会自动保存后端发送的所有Cookie（比如：SessionID）
                 * 并在后续的所有请求中带上，以保证基于 cookie 的服务器会话机制不会失效，
                 * 实现与 web 端共用会话机制（无需再手动维护 3rd_session_key） 
                 */
            }
        })
    }
})
```

![star](https://user-gold-cdn.xitu.io/2018/7/24/164ca9c0e943dcd7?w=240&h=240&f=png&s=41877)

如果对你有用，欢迎 star ^_^

