async function getCurrentUser(token) {
  if (!token) throw new Error('未登录或登录已过期');
  const uniID = uniCloud.uniID();
  const res = await uniID.checkToken(token);
  if (res.code) throw new Error('token已过期');
  const db = uniCloud.database();
  const userRes = await db.collection('uni-id-users').doc(res.uid).field({ _id: true, username: true, city_name: true, department_name: true, is_admin: true }).get();
  if (!userRes.data || userRes.data.length === 0) throw new Error('用户不存在');
  return userRes.data[0];
}

module.exports = {
  _before: function() {
    // 请求拦截器
  },

  async list(params = {}) {
    try {
      const { page = 1, page_size = 20, navigation_tab, search_keyword } = params;
      
      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      const db = uniCloud.database();
      const dbCmd = db.command;
      const collection = db.collection('web-cards');
      
      let where = { is_active: true };
      
      // 导航标签筛选
      if (navigation_tab && navigation_tab !== 'all') {
        where.navigation_tab = navigation_tab;
      }
      
      // 关键词搜索
      if (search_keyword) {
        where._id = dbCmd.or([
          { title: new RegExp(search_keyword, 'i') },
          { description: new RegExp(search_keyword, 'i') }
        ]);
      }
      
      // 权限过滤
      if (!user.is_admin) {
        where._id = dbCmd.or([
          { cities: dbCmd.in(['all', user.city_name]) },
          { departments: dbCmd.in(['all', user.department_name]) }
        ]);
      }

      const skip = (page - 1) * page_size;
      const result = await collection
        .where(where)
        .orderBy('sort_order', 'desc')
        .orderBy('created_at', 'desc')
        .skip(skip)
        .limit(page_size)
        .get();

      const countResult = await collection.where(where).count();
      
      return {
        code: 0,
        message: 'success',
        data: {
          list: result.data,
          total: countResult.total,
          page,
          page_size
        }
      };
    } catch (error) {
      console.error('Web-card list error:', error);
      return { code: 500, message: error.message };
    }
  },

  async detail(params = {}) {
    try {
      const { card_id } = params;
      
      if (!card_id) {
        return { code: 400, message: '缺少 card_id 参数' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      const db = uniCloud.database();
      const result = await db.collection('web-cards').doc(card_id).get();
      
      if (!result.data || result.data.length === 0) {
        return { code: 404, message: '卡片不存在' };
      }

      const card = result.data[0];
      
      // 权限检查
      if (!user.is_admin) {
        const hasPermission = 
          card.cities.includes('all') || 
          card.cities.includes(user.city_name) ||
          card.departments.includes('all') || 
          card.departments.includes(user.department_name);
        
        if (!hasPermission) {
          return { code: 403, message: '无权限访问该卡片' };
        }
      }

      return {
        code: 0,
        message: 'success',
        data: card
      };
    } catch (error) {
      console.error('Web-card detail error:', error);
      return { code: 500, message: error.message };
    }
  },

  async create(params = {}) {
    try {
      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      if (!user.is_admin) {
        return { code: 403, message: '无权限创建卡片' };
      }

      const {
        title,
        description,
        url,
        icon_name = 'Globe',
        icon_type = 'builtin',
        icon_color = '#3b82f6',
        open_mode = 'external',
        navigation_tab = '服务',
        cities = ['all'],
        departments = ['all'],
        is_active = true,
        sort_order = 0
      } = params;

      if (!title || !url) {
        return { code: 400, message: '缺少必填字段：title, url' };
      }

      const db = uniCloud.database();
      const now = Date.now();
      
      const cardData = {
        title,
        description,
        url,
        icon_name,
        icon_type,
        icon_color,
        open_mode,
        navigation_tab,
        cities,
        departments,
        is_active,
        sort_order,
        created_at: now,
        updated_at: now
      };

      const result = await db.collection('web-cards').add(cardData);

      return {
        code: 0,
        message: '创建成功',
        data: { id: result.id }
      };
    } catch (error) {
      console.error('Web-card create error:', error);
      return { code: 500, message: error.message };
    }
  },

  async update(params = {}) {
    try {
      const { card_id, ...updateData } = params;
      
      if (!card_id) {
        return { code: 400, message: '缺少 card_id 参数' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      if (!user.is_admin) {
        return { code: 403, message: '无权限更新卡片' };
      }

      const db = uniCloud.database();
      
      const checkResult = await db.collection('web-cards').doc(card_id).get();
      if (!checkResult.data || checkResult.data.length === 0) {
        return { code: 404, message: '卡片不存在' };
      }

      const allowedFields = [
        'title', 'description', 'url', 'icon_name', 'icon_type', 'icon_color',
        'open_mode', 'navigation_tab', 'cities', 'departments', 'is_active', 'sort_order'
      ];

      const updateObj = {};
      allowedFields.forEach(field => {
        if (updateData.hasOwnProperty(field)) {
          updateObj[field] = updateData[field];
        }
      });

      if (Object.keys(updateObj).length === 0) {
        return { code: 400, message: '没有需要更新的字段' };
      }

      updateObj.updated_at = Date.now();

      await db.collection('web-cards').doc(card_id).update(updateObj);

      return {
        code: 0,
        message: '更新成功'
      };
    } catch (error) {
      console.error('Web-card update error:', error);
      return { code: 500, message: error.message };
    }
  },

  async delete(params = {}) {
    try {
      const { card_id } = params;
      
      if (!card_id) {
        return { code: 400, message: '缺少 card_id 参数' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      if (!user.is_admin) {
        return { code: 403, message: '无权限删除卡片' };
      }

      const db = uniCloud.database();
      
      await db.collection('web-cards').doc(card_id).update({
        is_active: false,
        updated_at: Date.now()
      });

      return {
        code: 0,
        message: '删除成功'
      };
    } catch (error) {
      console.error('Web-card delete error:', error);
      return { code: 500, message: error.message };
    }
  },

  _after: function(error, result) {
    if (error) {
      return { code: 500, message: error.message };
    }
    return result;
  }
};
