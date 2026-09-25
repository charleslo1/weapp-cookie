/**
 * 适配小程序API宿主对象
 */
import { setHost } from './host'

/**
 * 识别宿主对象属于哪个平台
 * @param  {Object} api 宿主对象
 * @return {String}     平台标识
 */
export function detectPlatform (api) {
  if (!api) return 'none'
  if (typeof my !== 'undefined' && api === my) return 'my'
  if (typeof tt !== 'undefined' && api === tt) return 'tt'
  if (typeof swan !== 'undefined' && api === swan) return 'swan'
  if (typeof qq !== 'undefined' && api === qq) return 'qq'
  if (typeof wx !== 'undefined' && api === wx) {
    return typeof window !== 'undefined' && typeof location !== 'undefined' ? 'h5' : 'wx'
  }
  return 'none'
}

function getApi () {
  if (typeof my !== 'undefined') {
    my.platform = detectPlatform(my)
    return my
  } else if (typeof tt !== 'undefined') {
    tt.platform = detectPlatform(tt)
    return tt
  } else if (typeof swan !== 'undefined') {
    swan.platform = detectPlatform(swan)
    return swan
  } else if (typeof qq !== 'undefined') {
    qq.platform = detectPlatform(qq)
    return qq
  } else if (typeof wx !== 'undefined') {
    wx.platform = detectPlatform(wx)
    return wx
  }
  return { platform: 'none' }
}

const api = getApi()

// 记录当前宿主对象，供 Storage、请求代理等模块取用
setHost(api)

export default api
