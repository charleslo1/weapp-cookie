import api from './api'

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
    if (api.platform === 'my') {
      return api.setStorageSync({key: key, data: value})
    }
    return api.setStorageSync(key, value)
  }
}

// 单例
export default new LocalStorage(api)
