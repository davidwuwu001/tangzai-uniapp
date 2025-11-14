/**
 * 数据缓存工具
 * 用于缓存API数据，减少网络请求
 */
import { APP_CONFIG } from './config'

// 缓存键前缀
const CACHE_PREFIX = 'cache_'

// 缓存过期时间（默认5分钟）
const DEFAULT_EXPIRE_TIME = APP_CONFIG.cacheExpireTime || 5 * 60 * 1000

/**
 * 设置缓存
 * @param {String} key - 缓存键
 * @param {Any} data - 要缓存的数据
 * @param {Number} expireTime - 过期时间（毫秒），默认5分钟
 */
export function setCache(key, data, expireTime = DEFAULT_EXPIRE_TIME) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expireTime
    }
    
    const cacheKey = CACHE_PREFIX + key
    uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
    
    console.log(`缓存已保存: ${key}, 过期时间: ${expireTime}ms`)
  } catch (error) {
    console.error('保存缓存失败:', error)
  }
}

/**
 * 获取缓存
 * @param {String} key - 缓存键
 * @returns {Any|null} - 缓存数据，如果不存在或已过期则返回null
 */
export function getCache(key) {
  try {
    const cacheKey = CACHE_PREFIX + key
    const cacheStr = uni.getStorageSync(cacheKey)
    
    if (!cacheStr) {
      console.log(`缓存不存在: ${key}`)
      return null
    }
    
    const cacheData = JSON.parse(cacheStr)
    const now = Date.now()
    
    // 检查是否过期
    if (now - cacheData.timestamp > cacheData.expireTime) {
      console.log(`缓存已过期: ${key}`)
      removeCache(key)
      return null
    }
    
    console.log(`从缓存读取: ${key}`)
    return cacheData.data
    
  } catch (error) {
    console.error('读取缓存失败:', error)
    return null
  }
}

/**
 * 移除缓存
 * @param {String} key - 缓存键
 */
export function removeCache(key) {
  try {
    const cacheKey = CACHE_PREFIX + key
    uni.removeStorageSync(cacheKey)
    console.log(`缓存已删除: ${key}`)
  } catch (error) {
    console.error('删除缓存失败:', error)
  }
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
  try {
    const res = uni.getStorageInfoSync()
    const keys = res.keys || []
    
    // 只删除带缓存前缀的数据
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        uni.removeStorageSync(key)
      }
    })
    
    console.log('所有缓存已清除')
  } catch (error) {
    console.error('清除缓存失败:', error)
  }
}

/**
 * 带缓存的API请求
 * @param {String} cacheKey - 缓存键
 * @param {Function} apiFn - API请求函数
 * @param {Boolean} forceRefresh - 是否强制刷新（忽略缓存）
 * @param {Number} expireTime - 缓存过期时间
 * @returns {Promise}
 */
export async function cachedRequest(
  cacheKey, 
  apiFn, 
  forceRefresh = false, 
  expireTime = DEFAULT_EXPIRE_TIME
) {
  try {
    // 如果不是强制刷新，先尝试从缓存读取
    if (!forceRefresh) {
      const cachedData = getCache(cacheKey)
      if (cachedData !== null) {
        return cachedData
      }
    }
    
    // 缓存不存在或强制刷新，请求API
    console.log(`请求API: ${cacheKey}`)
    const data = await apiFn()
    
    // 保存到缓存
    setCache(cacheKey, data, expireTime)
    
    return data
    
  } catch (error) {
    console.error('缓存请求失败:', error)
    
    // 如果请求失败，尝试返回过期的缓存数据
    const cachedData = getCache(cacheKey)
    if (cachedData !== null) {
      console.log('API请求失败，返回缓存数据')
      return cachedData
    }
    
    throw error
  }
}

/**
 * 获取缓存信息（用于调试）
 */
export function getCacheInfo() {
  try {
    const res = uni.getStorageInfoSync()
    const keys = res.keys || []
    
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
    
    console.log('缓存统计:')
    console.log('- 总缓存项:', cacheKeys.length)
    console.log('- 占用空间:', res.currentSize + 'KB')
    console.log('- 缓存键列表:', cacheKeys.map(k => k.replace(CACHE_PREFIX, '')))
    
    return {
      count: cacheKeys.length,
      size: res.currentSize,
      keys: cacheKeys
    }
  } catch (error) {
    console.error('获取缓存信息失败:', error)
    return null
  }
}
