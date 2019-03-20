/**
 * 适配小程序API宿主对象
 */
export default (wx || window.wx || window.tt || window.my || window.swan)
