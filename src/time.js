import util from './util'

/**
 * 时间基准
 *
 * 默认直接使用设备时间，但设备时间可以被用户手动修改，一旦改到未来，
 * 所有 cookie 都会被判定为已过期并从 Storage 中清掉（见 #67）。
 * 使用者可以用 setNowTime 手动校准一次时间基准，以服务端时间为准。
 */
class Time {
  constructor () {
    // 校准后的时间与设备时间的偏移量（毫秒）
    this.__offsetTime = 0
  }

  /**
   * 校准时间基准
   * @param  {Date|Number|String} [nowTime] 当前真实时间，缺省则恢复为设备时间
   * @return {Date}                         校准后的当前时间
   */
  setNowTime (nowTime) {
    if (nowTime === undefined || nowTime === null || nowTime === '') {
      this.__offsetTime = 0
      return this.now()
    }

    let time = nowTime instanceof Date
      ? nowTime.getTime()
      : (typeof nowTime === 'number' ? nowTime : util.parseDate(nowTime))

    if (time === null || isNaN(time)) {
      throw new Error('weapp-cookie: setNowTime 的时间格式无法解析：' + nowTime)
    }

    this.__offsetTime = time - Date.now()

    return this.now()
  }

  /**
   * 获取当前时间（已校准）
   * @return {Date} 当前时间
   */
  now () {
    return new Date(this.getTime())
  }

  /**
   * 获取当前时间的时间戳（已校准）
   * @return {Number} 时间戳
   */
  getTime () {
    return Date.now() + this.__offsetTime
  }
}

// 单例
export default new Time()
