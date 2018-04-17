(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('babel-runtime/core-js/object/define-properties'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/createClass')) :
	typeof define === 'function' && define.amd ? define(['babel-runtime/core-js/object/define-properties', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass'], factory) :
	(global.priv = factory(global._Object$defineProperties,global._classCallCheck,global._createClass));
}(this, (function (_Object$defineProperties,_classCallCheck,_createClass) { 'use strict';

_Object$defineProperties = _Object$defineProperties && _Object$defineProperties.hasOwnProperty('default') ? _Object$defineProperties['default'] : _Object$defineProperties;
_classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
_createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;

/**
 * Cookie 类
 */
var Cookie = function () {
  /**
   * 构造函数
   */
  function Cookie(obj) {
    _classCallCheck(this, Cookie);

    this.key = obj.key || '';
    this.value = obj.value || '';
    // other
    this.domain = obj.domain || '';
    this.path = obj.path || '';
    this.expires = obj.expires ? new Date(obj.expires) : null;
    this.maxAge = obj.maxAge ? parseInt(obj.maxAge) : null;
    this.httpOnly = !!obj.httpOnly;
    // 记录时间
    this.dateTime = obj.dateTime ? new Date(obj.dateTime) : new Date();
  }

  /**
   * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
   */


  _createClass(Cookie, [{
    key: 'set',
    value: function set() {
      var _this = this;

      var setCookieStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      // 解析并设置 cookie 属性值
      var arr = setCookieStr.split(/\s*\\;\s*/g);
      arr.forEach(function (item, i) {
        var temp = item.split('=');
        if (i === 0) {
          _this.key = temp[0];
          _this.value = temp[1];
        } else {
          var prop = temp[0];
          var value = temp[1];
          prop = prop.replace(/-/g, '').replace(/^(\S)/g, (prop[0] || '').toLowerCase());

          switch (prop) {
            case 'maxAge':
              _this.maxAge = parseInt(value);
              break;
            case 'expires':
              _this.expires = new Date(value);
              break;
            case 'httpOnly':
              _this.httpOnly = true;
              break;
            default:
              _this[prop] = value;
              break;
          }
        }
      });

      // 更新设置时间
      this.dateTime = new Date();

      return this;
    }

    /**
     * 验证 cookie 是否还有效
     * @return {Boolean} 是否有效
     */

  }, {
    key: 'validate',
    value: function validate() {
      // maxAge 为 0，无效
      if (this.maxAge === 0) {
        return false;
      }
      // 存活秒数超出 maxAge，无效
      if (this.maxAge > 0) {
        var seconds = (Date.now() - this.dateTime.getTime()) / 1000;
        return seconds < this.maxAge;
      }
      // expires 小于当前时间，无效
      if (this.expires && this.expires < new Date()) {
        return false;
      }
      return true;
    }

    /**
     * 验证 cookie 是否可持久化
     * @return {Boolean} 是否可持久化
     */

  }, {
    key: 'isPersistence',
    value: function isPersistence() {
      return this.maxAge ? this.maxAge > 0 : true;
    }

    /**
     * 重写对象的 toString 方法
     */

  }, {
    key: 'toString',
    value: function toString() {
      return [this.key, this.value].join('=');
    }
  }]);

  return Cookie;
}();

/**
 * CookieStore 类
 */

var CookieStore = function () {
  /**
   * 构造函数
   */
  function CookieStore() {
    _classCallCheck(this, CookieStore);

    this.storageKey = 'cookie_store';
    this.cookies = this.readFromStorage();
  }

  /**
   * 获取 cookies
   */


  _createClass(CookieStore, [{
    key: 'getCookies',
    value: function getCookies(domain) {
      // 获取符合条件的 cookie
      var filterCookies = this.cookies.filter(function (item) {
        if (item.domain !== domain) return false;
        return item.validate();
      });

      // 转化为 request cookies 字符串
      return this.stringify(filterCookies);
    }

    /**
     * 设置 cookies
     */

  }, {
    key: 'setCookies',
    value: function setCookies(domain, cookieStr) {
      // 转换为 cookie 对象数组
      var parsedCookies = this.parse(domain, cookieStr);

      // 删除旧的同名 cookie
      var keys = parsedCookies.map(function (item) {
        return item.key;
      });
      this.removeCookies(domain, keys);

      // 设置新 cookie
      this.cookies = this.cookies.concat(parsedCookies);

      // 保存到本地存储
      this.saveToStorage();
    }

    /**
     * 删除 cookies
     * @param  {String} domain 域名
     * @param  {Array} keys   cookie 键列表
     */

  }, {
    key: 'removeCookies',
    value: function removeCookies(domain, keys) {
      // 删除 cookies
      this.cookies = this.cookies.filter(function (item) {
        return !(item.domain === domain && keys.indexOf(item.key) >= 0);
      });
    }

    /**
     * 将 cookies 保存到 Storage
     */

  }, {
    key: 'saveToStorage',
    value: function saveToStorage() {
      // 清除无效 cookie
      this.cookies = this.cookies.filter(function (item) {
        return item.validate();
      });

      // 只存储可持久化 cookie
      var saveCookies = this.cookies.filter(function (item) {
        return item.isPersistence();
      });

      // 保存到本地存储
      wx.setStorageSync(this.storageKey, saveCookies);
    }

    /**
     * 从 Storage 读取 cookies
     */

  }, {
    key: 'readFromStorage',
    value: function readFromStorage() {
      var cookies = wx.getStorageSync(this.storageKey) || [];
      this.cookies = cookies.map(function (item) {
        return new Cookie(item);
      });
      return this.cookies;
    }

    /**
     * 清除 cookies
     */

  }, {
    key: 'clearCookies',
    value: function clearCookies(domain) {
      this.cookies = domain ? this.cookies.filter(function (item) {
        return item.domain !== domain;
      }) : [];
      this.saveToStorage();
    }

    /**
     * 解析 response set-cookie 字段
     */

  }, {
    key: 'parse',
    value: function parse(domain) {
      var setCookieStr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      // 切分 cookies
      var cookies = setCookieStr.split(',');
      var fixCookies = [];

      // 修复被切分的 cookies
      cookies.forEach(function (item) {
        if (/^\S+\=/ig.test(item)) {
          fixCookies.push(item);
        } else {
          var lastIndex = fixCookies.length - 1;
          if (lastIndex < 0) return;
          fixCookies[lastIndex] = [fixCookies[lastIndex], item].join(',');
        }
      });

      // parse
      return fixCookies.map(function (item) {
        return new Cookie({ domain: domain }).set(item);
      });
    }

    /**
     * 将 cookies 字符串化，转化为 request cookies 字符串
     * @param  {Array} cookies cookie对象数组
     * @return {String}        cookie字符串
     */

  }, {
    key: 'stringify',
    value: function stringify(cookies) {
      return cookies.map(function (item) {
        return item.toString();
      }).join('; ');
    }
  }]);

  return CookieStore;
}();

/**
 * 微信 Cookie 代理
 * @param  {Object} wx      微信 API 对象
 * @param  {Object} request 微信请求函数
 */
var cookieStore = function (wx, request) {
  // 创建 cookieStore 实例
  var cookieStore = new CookieStore();

  /**
   * 定义请求代理函数
   * @param  {Object} options 请求参数
   */
  function requestProxy(options) {
    // 是否启用 cookie（默认 true）
    options.cookie = options.cookie === undefined || !!options.cookie;
    options.dataType = options.dataType || 'json';
    if (options.cookie) {
      // 域名
      var domain = new URL(options.url).host;

      // 获取请求 cookies
      var requestCookies = cookieStore.getCookies(domain);

      // 请求时带上设置的 cookies
      options.header = options.header || {};
      options.header['Cookie'] = requestCookies;
      options.header['X-Requested-With'] = 'XMLHttpRequest';
      if (options.dataType === 'json') {
        options.header['Accept'] = 'application/json, text/plain, */*';
      }

      // 请求成功回调
      var successCallback = options.success;
      options.success = function (response) {
        // 获取响应 cookies
        var responseCookies = response.header['set-cookie'];
        // 设置 cookies，以便下次请求带上
        cookieStore.setCookies(domain, responseCookies);
        successCallback && successCallback(response);
      };
    }

    // 发送网络请求
    request(options);
  }

  // 使用 requestProxy 覆盖微信原生 request
  _Object$defineProperties(wx, {
    request: {
      value: requestProxy
    }
  });

  // 返回 cookieStore
  return cookieStore;
}(wx, wx.request);

return cookieStore;

})));
//# sourceMappingURL=wxapp-cookie-shim.js.map
