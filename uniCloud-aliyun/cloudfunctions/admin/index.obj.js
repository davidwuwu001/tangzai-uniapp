'use strict';

const { checkPermission, getPermissionFilter } = require('common/permission');

// 获取当前登录用户 ID（基于 uni-id token）
async function getCurrentUid(ctx) {
  const token = ctx.getUniIdToken && ctx.getUniIdToken();
  if (!token) {
    throw new Error('未登录或登录已过期');
  }

  const uniID = uniCloud.uniID();
  const res = await uniID.checkToken(token);
  if (res.code) {
    throw new Error('登录状态已失效');
  }

  return res.uid;
}

module.exports = {
  // 统一前置校验：必须为管理员
  async _before() {
    const uid = await getCurrentUid(this);
    this.adminUid = uid;
    // 仅校验是否具备管理权限
    await checkPermission(uid, 'manage', 'admin-panel');
  },

  /**
   * 用户管理 - 列表
   * @param {Object} params
   * @param {Number} params.page
   * @param {Number} params.pageSize
   * @param {Number} params.city  城市ID（可选）
   * @param {String} params.department 部门（可选）
   * @param {String} params.search 搜索关键词（用户名/手机号）
   */
  async listUsers(params = {}) {
    try {
      const { page = 1, pageSize = 20, city, department, search } = params;
      const db = uniCloud.database();
      const dbCmd = db.command;
      const collection = db.collection('uni-id-users');

      let whereExpr = {};

      // 基础筛选
      if (city != null && city !== '') {
        whereExpr.city = city;
      }
      if (department) {
        whereExpr.department = department;
      }

      // 关键词搜索
      let searchExpr = null;
      if (search) {
        const reg = new RegExp(search, 'i');
        searchExpr = dbCmd.or([
          { username: reg },
          { mobile: reg }
        ]);
      }

      // 城市管理员范围限制
      const permissionFilter = await getPermissionFilter(this.adminUid, 'manage', 'user');

      // 组合条件
      const andConditions = [];
      if (Object.keys(whereExpr).length > 0) {
        andConditions.push(whereExpr);
      }
      if (searchExpr) {
        andConditions.push(searchExpr);
      }
      if (permissionFilter) {
        andConditions.push(permissionFilter);
      }

      const finalWhere = andConditions.length > 1
        ? dbCmd.and(...andConditions)
        : (andConditions[0] || {});

      const skip = (page - 1) * pageSize;

      const [listRes, countRes] = await Promise.all([
        collection
          .where(finalWhere)
          .orderBy('register_date', 'desc')
          .skip(skip)
          .limit(pageSize)
          .field({
            password: false,
            password_secret_version: false,
            token: false
          })
          .get(),
        collection.where(finalWhere).count()
      ]);

      return {
        code: 0,
        message: 'success',
        data: {
          list: listRes.data || [],
          total: countRes.total || 0,
          page,
          pageSize
        }
      };
    } catch (error) {
      console.error('admin.listUsers error:', error);
      return { code: 500, message: error.message || '获取用户列表失败' };
    }
  },

  /**
   * 用户管理 - 更新
   * @param {Object} params
   * @param {String} params.id 用户ID
   * 允许更新字段：city, city_name, department, is_admin, avatar, nickname, role, permission
   */
  async updateUser(params = {}) {
    try {
      const { id, ...updateData } = params;
      if (!id) {
        return { code: 400, message: '缺少用户ID' };
      }

      const db = uniCloud.database();
      const collection = db.collection('uni-id-users');

      // 先拉取用户，做范围校验（城市管理员只能改自己城市的用户）
      const userRes = await collection.doc(id).get();
      if (!userRes.data || userRes.data.length === 0) {
        return { code: 404, message: '用户不存在' };
      }
      const targetUser = userRes.data[0];

      const permissionFilter = await getPermissionFilter(this.adminUid, 'manage', 'user');
      if (permissionFilter && permissionFilter.city != null) {
        if (targetUser.city !== permissionFilter.city) {
          return { code: 403, message: '无权限管理该用户' };
        }
      }

      const allowedFields = [
        'city',
        'city_name',
        'department',
        'is_admin',
        'avatar',
        'nickname',
        'role',
        'permission'
      ];

      const updateObj = {};
      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          updateObj[field] = updateData[field];
        }
      });

      if (Object.keys(updateObj).length === 0) {
        return { code: 400, message: '没有需要更新的字段' };
      }

      updateObj.last_login_date = targetUser.last_login_date || null;

      await collection.doc(id).update(updateObj);

      return { code: 0, message: '更新成功' };
    } catch (error) {
      console.error('admin.updateUser error:', error);
      return { code: 500, message: error.message || '更新用户失败' };
    }
  },

  /**
   * 用户管理 - 重置密码
   * 简化实现：将密码重置为固定前缀+后四位手机，或返回一个随机密码
   */
  async resetPassword(params = {}) {
    try {
      const { id, newPassword } = params;
      if (!id) {
        return { code: 400, message: '缺少用户ID' };
      }

      const db = uniCloud.database();
      const collection = db.collection('uni-id-users');

      const userRes = await collection.doc(id).get();
      if (!userRes.data || userRes.data.length === 0) {
        return { code: 404, message: '用户不存在' };
      }
      const user = userRes.data[0];

      const finalPassword = newPassword || `Tz${String(user.mobile).slice(-4)}`;

      // 这里假设使用 uni-id 的加密工具，后续可替换为 uni-id 密码修改接口
      const crypto = require('crypto');
      const encryptedPwd = crypto
        .createHash('sha256')
        .update(finalPassword)
        .digest('hex');

      await collection.doc(id).update({ password: encryptedPwd });

      return {
        code: 0,
        message: '重置密码成功',
        data: { newPassword: finalPassword }
      };
    } catch (error) {
      console.error('admin.resetPassword error:', error);
      return { code: 500, message: error.message || '重置密码失败' };
    }
  },

  // 城市管理
  async listCities() {
    try {
      const db = uniCloud.database();
      const res = await db
        .collection('cities')
        .orderBy('created_at', 'asc')
        .get();

      return {
        code: 0,
        message: 'success',
        data: res.data || []
      };
    } catch (error) {
      console.error('admin.listCities error:', error);
      return { code: 500, message: error.message || '获取城市列表失败' };
    }
  },

  async createCity(params = {}) {
    try {
      const { name, code, is_active = true } = params;
      if (!name || !code) {
        return { code: 400, message: '城市名称和代码必填' };
      }

      const db = uniCloud.database();
      const now = Date.now();

      const insertRes = await db.collection('cities').add({
        name,
        code,
        is_active,
        created_at: now
      });

      return {
        code: 0,
        message: '创建成功',
        data: { id: insertRes.id }
      };
    } catch (error) {
      console.error('admin.createCity error:', error);
      return { code: 500, message: error.message || '创建城市失败' };
    }
  },

  async updateCity(params = {}) {
    try {
      const { id, ...updateData } = params;
      if (!id) {
        return { code: 400, message: '缺少城市ID' };
      }

      const db = uniCloud.database();
      const allowedFields = ['name', 'code', 'is_active'];
      const updateObj = {};
      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          updateObj[field] = updateData[field];
        }
      });

      if (Object.keys(updateObj).length === 0) {
        return { code: 400, message: '没有需要更新的字段' };
      }

      await db.collection('cities').doc(id).update(updateObj);

      return { code: 0, message: '更新成功' };
    } catch (error) {
      console.error('admin.updateCity error:', error);
      return { code: 500, message: error.message || '更新城市失败' };
    }
  },

  async deleteCity(params = {}) {
    try {
      const { id } = params;
      if (!id) {
        return { code: 400, message: '缺少城市ID' };
      }

      const db = uniCloud.database();
      await db.collection('cities').doc(id).remove();

      return { code: 0, message: '删除成功' };
    } catch (error) {
      console.error('admin.deleteCity error:', error);
      return { code: 500, message: error.message || '删除城市失败' };
    }
  },

  // 部门管理（简化版本，后续可按需要补充分页、筛选等）
  async listDepartments() {
    try {
      const db = uniCloud.database();
      const res = await db
        .collection('departments')
        .orderBy('sort_order', 'asc')
        .get();

      return {
        code: 0,
        message: 'success',
        data: res.data || []
      };
    } catch (error) {
      console.error('admin.listDepartments error:', error);
      return { code: 500, message: error.message || '获取部门列表失败' };
    }
  },

  async createDepartment(params = {}) {
    try {
      const { name, description = '', sort_order = 0, is_active = true } = params;
      if (!name) {
        return { code: 400, message: '部门名称必填' };
      }

      const db = uniCloud.database();
      const now = Date.now();

      const res = await db.collection('departments').add({
        name,
        description,
        sort_order,
        is_active,
        created_at: now,
        updated_at: now
      });

      return {
        code: 0,
        message: '创建成功',
        data: { id: res.id }
      };
    } catch (error) {
      console.error('admin.createDepartment error:', error);
      return { code: 500, message: error.message || '创建部门失败' };
    }
  },

  async updateDepartment(params = {}) {
    try {
      const { id, ...updateData } = params;
      if (!id) {
        return { code: 400, message: '缺少部门ID' };
      }

      const db = uniCloud.database();
      const allowedFields = ['name', 'description', 'sort_order', 'is_active'];
      const updateObj = {};
      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          updateObj[field] = updateData[field];
        }
      });

      if (Object.keys(updateObj).length === 0) {
        return { code: 400, message: '没有需要更新的字段' };
      }

      updateObj.updated_at = Date.now();

      await db.collection('departments').doc(id).update(updateObj);

      return { code: 0, message: '更新成功' };
    } catch (error) {
      console.error('admin.updateDepartment error:', error);
      return { code: 500, message: error.message || '更新部门失败' };
    }
  },

  async deleteDepartment(params = {}) {
    try {
      const { id } = params;
      if (!id) {
        return { code: 400, message: '缺少部门ID' };
      }

      const db = uniCloud.database();
      await db.collection('departments').doc(id).remove();

      return { code: 0, message: '删除成功' };
    } catch (error) {
      console.error('admin.deleteDepartment error:', error);
      return { code: 500, message: error.message || '删除部门失败' };
    }
  },

  // 模型管理
  async listModels() {
    try {
      const db = uniCloud.database();
      const res = await db
        .collection('models')
        .orderBy('created_at', 'desc')
        .get();

      return {
        code: 0,
        message: 'success',
        data: res.data || []
      };
    } catch (error) {
      console.error('admin.listModels error:', error);
      return { code: 500, message: error.message || '获取模型列表失败' };
    }
  },

  async createModel(params = {}) {
    try {
      const { name, api_url, api_key, model_type = 'openai' } = params;
      if (!name || !api_url || !api_key) {
        return { code: 400, message: '模型名称、API 地址和密钥必填' };
      }

      const db = uniCloud.database();
      const now = Date.now();

      const res = await db.collection('models').add({
        name,
        api_url,
        api_key,
        model_type: model_type || 'openai',
        created_at: now,
        updated_at: now
      });

      return {
        code: 0,
        message: '创建成功',
        data: { id: res.id }
      };
    } catch (error) {
      console.error('admin.createModel error:', error);
      return { code: 500, message: error.message || '创建模型失败' };
    }
  },

  async updateModel(params = {}) {
    try {
      const { id, ...updateData } = params;
      if (!id) {
        return { code: 400, message: '缺少模型ID' };
      }

      const db = uniCloud.database();
      const allowedFields = ['name', 'api_url', 'api_key', 'model_type'];
      const updateObj = {};
      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          updateObj[field] = updateData[field];
        }
      });

      if (Object.keys(updateObj).length === 0) {
        return { code: 400, message: '没有需要更新的字段' };
      }

      updateObj.updated_at = Date.now();

      await db.collection('models').doc(id).update(updateObj);

      return { code: 0, message: '更新成功' };
    } catch (error) {
      console.error('admin.updateModel error:', error);
      return { code: 500, message: error.message || '更新模型失败' };
    }
  },

  async deleteModel(params = {}) {
    try {
      const { id } = params;
      if (!id) {
        return { code: 400, message: '缺少模型ID' };
      }

      const db = uniCloud.database();
      await db.collection('models').doc(id).remove();

      return { code: 0, message: '删除成功' };
    } catch (error) {
      console.error('admin.deleteModel error:', error);
      return { code: 500, message: error.message || '删除模型失败' };
    }
  }
};
