'use strict';

/**
 * 权限中间件
 * 统一处理：
 * - 管理端/客户端动作的权限校验（checkPermission）
 * - 返回基于当前用户的查询过滤条件（getPermissionFilter）
 *
 * 约定：
 * - uni-id 用户表：uni-id-users
 * - 管理员标记：is_admin = true
 * - 城市信息：city（城市ID）、city_name（城市名称）
 * - 部门信息：department（部门名称字符串）
 *
 * action:
 * - 'view'   客户端普通查看
 * - 'manage' 管理端管理操作
 */

const db = uniCloud.database();
const dbCmd = db.command;

async function getUserById(userId) {
  if (!userId) {
    throw new Error('未登录或登录已过期');
  }

  const res = await db
    .collection('uni-id-users')
    .doc(userId)
    .field({
      _id: true,
      username: true,
      city: true,
      city_name: true,
      department: true,
      is_admin: true,
      role: true
    })
    .get();

  if (!res.data || res.data.length === 0) {
    throw new Error('用户不存在');
  }

  return res.data[0];
}

/**
 * 获取资源的权限过滤条件
 *
 * @param {String} userId 当前用户ID
 * @param {String} action 'view' | 'manage'
 * @param {String} resource 资源标识：'agent' | 'web-card' | 'feishu-card' | 'user' | ...
 * @returns {Object|null} 可用于 db.where(...) 的条件，null 表示不过滤
 */
async function getPermissionFilter(userId, action = 'view', resource = '') {
  const user = await getUserById(userId);

  const isAdmin = !!user.is_admin;
  const hasCity = user.city != null && user.city !== '';

  // 管理操作必须是管理员
  if (action === 'manage' && !isAdmin) {
    throw new Error('无管理权限');
  }

  // 系统管理员：不限制范围
  if (isAdmin && !hasCity) {
    return null;
  }

  // 城市管理员：在部分资源上限制范围
  const cityName = user.city_name;
  const departmentName = user.department;

  switch (resource) {
    case 'agent':
    case 'web-card':
    case 'feishu-card':
      // 资源表结构约定：cities / departments 为数组
      return dbCmd.or([
        { cities: dbCmd.in(['all', cityName]) },
        { departments: dbCmd.in(['all', departmentName]) }
      ]);

    case 'user':
      // 用户列表：城市管理员只能看到本城市
      if (isAdmin && hasCity) {
        return { city: user.city };
      }
      return null;

    default:
      // 其余资源暂不做范围过滤，仅靠 is_admin 拦截
      return null;
  }
}

/**
 * 权限校验
 *
 * @param {String} userId 当前用户ID
 * @param {String} action 'view' | 'manage'
 * @param {String} resource 资源标识
 * @returns {Promise<Boolean>} 有权限返回 true，无权限抛错
 */
async function checkPermission(userId, action = 'view', resource = '') {
  const user = await getUserById(userId);

  const isAdmin = !!user.is_admin;

  if (action === 'manage' && !isAdmin) {
    throw new Error('无管理权限');
  }

  // 如后续有更细粒度权限（role / permission 字段），在此追加检查

  return true;
}

module.exports = {
  getPermissionFilter,
  checkPermission
};
