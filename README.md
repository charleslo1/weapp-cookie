# wxapp-cookie-shim
> 一行代码让微信小程序支持 cookie，以保证基于 cookie 的服务器会话机制不会失效，与 web 端共用会话机制

# Install

``` sh
npm install wxapp-cookie-shim --save
```

# Usage

在小程序根目录的 app.js 一行代码引入即可

``` js
// app.js
import './node_modules/wxapp-cookie-shim/index'

App({
    onLaunch: function () { }
    // ...
})
```

原来的 wx.request 调用方式保持不变，引入后 wxapp-cookie-shim 会在底层自动代理 wx.request 的接口访问，以支持 cookie 存储和发送

``` js
// pages/index.js

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
                 * 登录成功后 wxapp-cookie-shim 会自动保存后端发送的所有Cookie（比如：SessionID）
                 * 并在后续的所有请求中带上，以保证基于 cookie 的服务器会话机制不会失效，
                 * 实现与 web 端共用会话机制（无需再手动维护 3rd_session_key） 
                 */
            }
        })
    }
})
```

