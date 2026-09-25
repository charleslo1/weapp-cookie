/**
 * 当前宿主对象
 *
 * 宿主对象（wx / my / tt / swan / qq / uni）既可能在本库加载前就绪，
 * 也可能在本库之后才出现（uni-app APP 端，见 #58）。Storage、平台判断
 * 与请求代理都从这里取当前宿主，以便宿主变化后立即生效。
 */
let host = { platform: 'none' }

/**
 * 获取当前宿主对象
 * @return {Object} 宿主对象
 */
export function getHost () {
  return host
}

/**
 * 设置当前宿主对象
 * @param  {Object} target 宿主对象
 * @return {Object}        设置后的宿主对象
 */
export function setHost (target) {
  if (target) host = target
  return host
}
