(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.weappCookie = factory());
}(this, (function () { 'use strict';

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx = function (fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function (it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var document = _global.document;
// typeof document.createElement is 'object' in old IE
var is = _isObject(document) && _isObject(document.createElement);
var _domCreate = function (it) {
  return is ? document.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function (it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty = {}.hasOwnProperty;
var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && _has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? _ctx(out, _global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
var _export = $export;

var toString = {}.toString;

var _cof = function (it) {
  return toString.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings

// eslint-disable-next-line no-prototype-builtins
var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// to indexed object, toObject with fallback for non-array-like ES3 strings


var _toIobject = function (it) {
  return _iobject(_defined(it));
};

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
var _toInteger = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

// 7.1.15 ToLength

var min = Math.min;
var _toLength = function (it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;
var _toAbsoluteIndex = function (index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes



var _arrayIncludes = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var _library = true;

var _shared = createCommonjsModule(function (module) {
var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: _core.version,
  mode: _library ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});
});

var id = 0;
var px = Math.random();
var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var shared = _shared('keys');

var _sharedKey = function (key) {
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO = _sharedKey('IE_PROTO');

var _objectKeysInternal = function (object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (_has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)



var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
  return O;
};

// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
_export(_export.S + _export.F * !_descriptors, 'Object', { defineProperties: _objectDps });

var $Object = _core.Object;
var defineProperties$1 = function defineProperties(T, D) {
  return $Object.defineProperties(T, D);
};

var defineProperties = createCommonjsModule(function (module) {
module.exports = { "default": defineProperties$1, __esModule: true };
});

var _Object$defineProperties = unwrapExports(defineProperties);

var classCallCheck = createCommonjsModule(function (module, exports) {
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
});

var _classCallCheck = unwrapExports(classCallCheck);

// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
_export(_export.S + _export.F * !_descriptors, 'Object', { defineProperty: _objectDp.f });

var $Object$1 = _core.Object;
var defineProperty$2 = function defineProperty(it, key, desc) {
  return $Object$1.defineProperty(it, key, desc);
};

var defineProperty = createCommonjsModule(function (module) {
module.exports = { "default": defineProperty$2, __esModule: true };
});

unwrapExports(defineProperty);

var createClass = createCommonjsModule(function (module, exports) {
"use strict";

exports.__esModule = true;



var _defineProperty2 = _interopRequireDefault(defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
});

var _createClass = unwrapExports(createClass);

var f$1 = Object.getOwnPropertySymbols;

var _objectGops = {
	f: f$1
};

var f$2 = {}.propertyIsEnumerable;

var _objectPie = {
	f: f$2
};

// 7.1.13 ToObject(argument)

var _toObject = function (it) {
  return Object(_defined(it));
};

'use strict';
// 19.1.2.1 Object.assign(target, source, ...)





var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
var _objectAssign = !$assign || _fails(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = _toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = _objectGops.f;
  var isEnum = _objectPie.f;
  while (aLen > index) {
    var S = _iobject(arguments[index++]);
    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;

// 19.1.3.1 Object.assign(target, source)


_export(_export.S + _export.F, 'Object', { assign: _objectAssign });

var assign$1 = _core.Object.assign;

var assign = createCommonjsModule(function (module) {
module.exports = { "default": assign$1, __esModule: true };
});

var _Object$assign = unwrapExports(assign);

"use strict";

var defaultParseOptions = {
  decodeValues: true
};

function extend(target, source) {
  return Object.keys(source).reduce(function(target, key) {
    target[key] = source[key];
    return target;
  }, target);
}

function isNonEmptyString(str) {
  return typeof str === "string" && !!str.trim();
}

function parseString(setCookieValue, options) {
  var parts = setCookieValue.split(";").filter(isNonEmptyString);
  var nameValue = parts.shift().split("=");
  var name = nameValue.shift();
  var value = nameValue.join("="); // everything after the first =, joined by a "=" if there was more than one part
  var cookie = {
    name: name, // grab everything before the first =
    value: options.decodeValues ? decodeURIComponent(value) : value // decode cookie value
  };

  parts.forEach(function(part) {
    var sides = part.split("=");
    var key = sides
      .shift()
      .trimLeft()
      .toLowerCase();
    var value = sides.join("=");
    if (key === "expires") {
      cookie.expires = new Date(value);
    } else if (key === "max-age") {
      cookie.maxAge = parseInt(value, 10);
    } else if (key === "secure") {
      cookie.secure = true;
    } else if (key === "httponly") {
      cookie.httpOnly = true;
    } else if (key === "samesite") {
      cookie.sameSite = value;
    } else {
      cookie[key] = value;
    }
  });

  return cookie;
}

function parse(input, options) {
  if (!input) {
    return [];
  }
  if (input.headers) {
    input = input.headers["set-cookie"];
  }
  if (!Array.isArray(input)) {
    input = [input];
  }

  var defaultOptions = extend({}, defaultParseOptions);
  if (options) {
    options = extend(defaultOptions, options);
  } else {
    options = defaultOptions;
  }

  return input.filter(isNonEmptyString).map(function(str) {
    return parseString(str, options);
  });
}

/*
  Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas
  that are within a single set-cookie field-value, such as in the Expires portion.

  This is uncommon, but explicitly allowed - see https://tools.ietf.org/html/rfc2616#section-4.2
  Node.js does this for every header *except* set-cookie - see https://github.com/nodejs/node/blob/d5e363b77ebaf1caf67cd7528224b651c86815c1/lib/_http_incoming.js#L128
  React Native's fetch does this for *every* header, including set-cookie.

  Based on: https://github.com/google/j2objc/commit/16820fdbc8f76ca0c33472810ce0cb03d20efe25
  Credits to: https://github.com/tomball for original and https://github.com/chrusart for JavaScript implementation
*/
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString;
  }
  if (typeof cookiesString !== "string") {
    return [];
  }

  var cookiesStrings = [];
  var pos = 0;
  var start;
  var ch;
  var lastComma;
  var nextStart;
  var cookiesSeparatorFound;

  function skipWhitespace() {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  }

  function notSpecialChar() {
    ch = cookiesString.charAt(pos);

    return ch !== "=" && ch !== ";" && ch !== ",";
  }

  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;

    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        // ',' is a cookie separator if we have later first '=', not ';' or ','
        lastComma = pos;
        pos += 1;

        skipWhitespace();
        nextStart = pos;

        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }

        // currently special character
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          // we found cookies separator
          cookiesSeparatorFound = true;
          // pos is inside the next cookie, so back up and return it.
          pos = nextStart;
          cookiesStrings.push(cookiesString.substring(start, lastComma));
          start = pos;
        } else {
          // in param ',' or param separator ';',
          // we continue from that comma
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }

    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
    }
  }

  return cookiesStrings;
}

var setCookie = parse;
var parse_1 = parse;
var splitCookiesString_1 = splitCookiesString;

setCookie.parse = parse_1;
setCookie.splitCookiesString = splitCookiesString_1;

/**
 * Cookie 类
 */

var Cookie = function () {
  /**
   * 构造函数
   */
  function Cookie(props) {
    _classCallCheck(this, Cookie);

    this.name = props.name || '';
    this.value = props.value || '';
    // other
    this.domain = props.domain || '';
    this.path = props.path || '';
    this.expires = props.expires ? new Date(props.expires) : null;
    this.maxAge = props.maxAge ? parseInt(props.maxAge) : null;
    this.httpOnly = !!props.httpOnly;
    // 记录时间
    this.dateTime = props.dateTime ? new Date(props.dateTime) : new Date();
  }

  /**
   * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
   */


  _createClass(Cookie, [{
    key: 'set',
    value: function set() {
      var setCookieStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var cookie = setCookie.parse(setCookieStr)[0];
      if (cookie) {
        _Object$assign(this, cookie);
        // 更新设置时间
        this.dateTime = new Date();
      }

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
      return [this.name, this.value].join('=');
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
        return item.name;
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
        return !(item.domain === domain && keys.indexOf(item.name) >= 0);
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

      // parse
      var cookies = setCookie.parse(setCookie.splitCookiesString(setCookieStr));

      // 转换为 Cookie 对象
      return cookies.map(function (item) {
        item.domain = domain;
        return new Cookie(item);
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
      var domain = (options.url || '').split('/')[2];

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
//# sourceMappingURL=weapp-cookie.js.map
