/**
 * 认证相关API
 */
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/utils/config'

/**
 * 用户登录
 * @param {string} identifier - 用户名/邮箱/手机号
 * @param {string} password - 密码
 */
export function login(identifier, password) {
  return request.post(API_ENDPOINTS.LOGIN, {
    identifier,
    password
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册数据
 */
export function register(data) {
  return request.post(API_ENDPOINTS.REGISTER, data)
}

/**
 * 用户登出
 */
export function logout() {
  return request.post(API_ENDPOINTS.LOGOUT)
}

/**
 * 重置密码
 * @param {Object} data - 重置密码数据
 */
export function resetPassword(data) {
  return request.post(API_ENDPOINTS.RESET_PASSWORD, data)
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request.get(API_ENDPOINTS.USER_INFO)
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 */
export function updateUser(data) {
  return request.put(API_ENDPOINTS.UPDATE_USER, data)
}

/**
 * 上传头像
 * @param {string} filePath - 文件路径
 */
export function uploadAvatar(filePath) {
  return request.upload(API_ENDPOINTS.UPLOAD_AVATAR, filePath)
}
