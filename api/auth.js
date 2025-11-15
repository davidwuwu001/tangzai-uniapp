/**
 * 认证相关API - 使用 uniCloud 云对象
 */

/**
 * 用户登录
 * @param {string} identifier - 用户名/邮箱/手机号
 * @param {string} password - 密码
 */
export function login(identifier, password) {
  const userObj = uniCloud.importObject('user')
  return userObj.login({
    mobile: identifier,
    password
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册数据
 */
export function register(data) {
  const userObj = uniCloud.importObject('user')
  return userObj.register(data)
}

/**
 * 用户登出
 */
export function logout() {
  const userObj = uniCloud.importObject('user')
  return userObj.logout()
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  const userObj = uniCloud.importObject('user')
  return userObj.getUserInfo()
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 */
export function updateUser(data) {
  const userObj = uniCloud.importObject('user')
  return userObj.updateUserInfo(data)
}

/**
 * 修改密码
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 */
export function changePassword(oldPassword, newPassword) {
  const userObj = uniCloud.importObject('user')
  return userObj.changePassword({
    oldPassword,
    newPassword
  })
}
