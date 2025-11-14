/**
 * 卡片数据相关API
 */
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/utils/config'

/**
 * 获取教研助手列表（Agents）
 * @param {Object} params - 查询参数
 * @param {String} params.search - 搜索关键词
 * @param {String} params.city - 城市过滤
 * @param {String} params.department - 部门过滤
 * @returns {Promise}
 */
export function getAgents(params = {}) {
  return request.get(API_ENDPOINTS.AGENTS, params)
}

/**
 * 获取单个教研助手详情
 * @param {Number} id - 助手ID
 * @returns {Promise}
 */
export function getAgentDetail(id) {
  return request.get(`${API_ENDPOINTS.AGENTS}/${id}`)
}

/**
 * 获取网页服务卡片列表（Web Cards）
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getWebCards(params = {}) {
  return request.get(API_ENDPOINTS.WEB_CARDS, params)
}

/**
 * 获取飞书数据卡片列表（Feishu Cards）
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFeishuCards(params = {}) {
  return request.get(API_ENDPOINTS.FEISHU_CARDS, params)
}

/**
 * 获取飞书数据详情
 * @param {Number} id - 数据ID
 * @returns {Promise}
 */
export function getFeishuDataDetail(id) {
  return request.get(`${API_ENDPOINTS.FEISHU_DATA}/${id}`)
}

/**
 * 收藏卡片
 * @param {Number} cardId - 卡片ID
 * @param {String} cardType - 卡片类型: agent/web/feishu
 * @returns {Promise}
 */
export function favoriteCard(cardId, cardType) {
  return request.post('/api/favorites', {
    cardId,
    cardType
  })
}

/**
 * 取消收藏
 * @param {Number} cardId - 卡片ID
 * @returns {Promise}
 */
export function unfavoriteCard(cardId) {
  return request.delete(`/api/favorites/${cardId}`)
}

/**
 * 获取我的收藏列表
 * @returns {Promise}
 */
export function getMyFavorites() {
  return request.get('/api/favorites')
}
