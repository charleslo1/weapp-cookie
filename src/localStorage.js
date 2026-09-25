import { getHost } from './host'

/**
 * LocalStorage 类
 */
class LocalStorage {
  /**
   * 获取数据项
   * @param {String} key   键
   */
  getItem (key) {
    // 屏蔽支付宝小程序语法差异
    let api = getHost()
    // 宿主对象尚未就绪（如 uni-app APP 端本库先于 uni 加载）时不做读写
    if (typeof api.getStorageSync !== 'function') return
    if (api.platform === 'my') {
      return api.getStorageSync({key: key}).data
    }
    return api.getStorageSync(key)
  }

  /**
   * 设置数据项
   * @param {String} key   键
   * @param {Any} value 值
   */
  setItem (key, value) {
    // 屏蔽支付宝小程序语法差异
    let api = getHost()
    // 宿主对象尚未就绪时不做读写
    if (typeof api.setStorageSync !== 'function') return
    if (api.platform === 'my') {
      return api.setStorageSync({key: key, data: value})
    }
    return api.setStorageSync(key, value)
  }
}

// 单例
export default new LocalStorage()
