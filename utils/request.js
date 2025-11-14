/**
 * 网络请求封装工具
 * 基于 uni.request 封装，提供统一的请求和响应处理
 */
import config from '@/utils/config'

// 后端API基础地址
let BASE_URL = config.apiBaseUrl

// 请求超时时间
const TIMEOUT = 30000

/**
 * 通用请求方法
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('auth_token') || ''
    
    // 构建请求配置
    const config = {
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: options.timeout || TIMEOUT
    }

    // 添加token到请求头
    if (token) {
      config.header['Authorization'] = `Bearer ${token}`
    }

    // 打印请求信息（开发环境）
    console.log('📤 发送请求:', config.url)
    console.log('📋 请求参数:', config.data)

    // 发送请求
    uni.request({
      ...config,
      success: (res) => {
        console.log('📥 响应数据:', res.data)

        // 响应成功
        if (res.statusCode === 200) {
          // 检查业务状态码
          if (res.data.success || res.data.code === 200 || res.data.token) {
            resolve(res.data)
          } else {
            // 业务错误
            handleError(res.data.message || res.data.error || '请求失败', reject)
          }
        } 
        // token过期或未登录
        else if (res.statusCode === 401) {
          handleUnauthorized()
          reject(new Error('登录已过期，请重新登录'))
        }
        // 其他HTTP错误
        else {
          handleError(`请求失败 (${res.statusCode})`, reject)
        }
      },
      fail: (err) => {
        console.error('❌ 请求失败:', err)
        handleNetworkError(err, reject)
      }
    })
  })
}

/**
 * 处理业务错误
 */
function handleError(message, reject) {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
  reject(new Error(message))
}

/**
 * 处理网络错误
 */
function handleNetworkError(err, reject) {
  let message = '网络连接失败'
  
  if (err.errMsg) {
    if (err.errMsg.includes('timeout')) {
      message = '请求超时，请检查网络'
    } else if (err.errMsg.includes('fail')) {
      message = '网络请求失败，请检查网络连接'
    }
  }

  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
  
  reject(new Error(message))
}

/**
 * 处理未授权（token过期）
 */
function handleUnauthorized() {
  // 清除token和用户信息
  uni.removeStorageSync('auth_token')
  uni.removeStorageSync('user_info')

  // 提示用户
  uni.showToast({
    title: '登录已过期',
    icon: 'none',
    duration: 2000
  })

  // 延迟跳转到登录页
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }, 2000)
}

/**
 * GET 请求
 */
function get(url, data = {}, options = {}) {
  // GET请求参数拼接到URL
  const params = Object.keys(data).map(key => 
    `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
  ).join('&')
  
  const fullUrl = params ? `${url}?${params}` : url

  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  })
}

/**
 * POST 请求
 */
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 */
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 上传文件
 */
function upload(url, filePath, formData = {}) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('auth_token') || ''

    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name: 'file',
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          resolve(data)
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: (err) => {
        console.error('上传失败:', err)
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 导出
export default {
  get,
  post,
  put,
  delete: del,
  upload,
  request
}

// 设置基础URL（用于动态修改）
export function setBaseURL(url) {
  BASE_URL = url
}

// 获取基础URL
export function getBaseURL() {
  return BASE_URL
}
