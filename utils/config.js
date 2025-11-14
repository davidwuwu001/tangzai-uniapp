/**
 * 应用配置文件
 */

// 开发环境配置
const dev = {
  // TODO: 【重要】请修改为你的 tangzai-zhushou-1105 项目的 Vercel 地址
  // 步骤：
  // 1. 登录 Vercel (https://vercel.com)
  // 2. 找到 tangzai-zhushou-1105 项目
  // 3. 复制部署地址（例如：https://tangzai-zhushou-1105.vercel.app）
  // 4. 替换下面的 apiBaseUrl
  apiBaseUrl: 'https://tangzai-zhushou-1105.vercel.app',
  
  // 如果后端在本地运行，可以使用:
  // apiBaseUrl: 'http://localhost:3000',
}

// 生产环境配置
const prod = {
  // TODO: 【重要】生产环境也使用 Vercel 地址
  apiBaseUrl: 'https://tangzai-zhushou-1105.vercel.app',
}

// 根据环境选择配置
const config = process.env.NODE_ENV === 'production' ? prod : dev

// API端点配置
export const API_ENDPOINTS = {
  // 认证相关
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // 用户相关
  USER_INFO: '/api/user/info',
  UPDATE_USER: '/api/user/update',
  UPLOAD_AVATAR: '/api/user/avatar',
  
  // 卡片相关
  AGENTS: '/api/agents',
  WEB_CARDS: '/api/web-cards',
  FEISHU_CARDS: '/api/feishu-cards',
  
  // 飞书数据
  FEISHU_DATA: '/api/feishu-data',
  
  // AI对话
  CHAT: '/api/chat',
  CHAT_HISTORY: '/api/chat/history',
  
  // 管理员相关
  ADMIN_USERS: '/api/admin/users',
  ADMIN_AGENTS: '/api/admin/agents',
}

// 应用配置
export const APP_CONFIG = {
  // 应用名称
  appName: '汤仔助手',
  // 应用版本
  version: '1.0.0',
  // 缓存过期时间（毫秒）
  cacheExpireTime: 5 * 60 * 1000, // 5分钟
  // 请求超时时间
  requestTimeout: 30000, // 30秒
}

export default config
