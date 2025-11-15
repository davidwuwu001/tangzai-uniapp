async function getCurrentUser(token) {
  if (!token) throw new Error('未登录或登录已过期');
  
  const db = uniCloud.database();
  // 使用自定义 token 查询用户
  const userRes = await db.collection('uni-id-users')
    .where({ token: token })
    .field({ _id: true, username: true, city_name: true, department_name: true, is_admin: true, token_expired: true })
    .get();
  
  if (!userRes.data || userRes.data.length === 0) {
    throw new Error('未登录或登录已过期');
  }
  
  const user = userRes.data[0];
  
  // 检查 token 是否过期
  if (user.token_expired && user.token_expired < Date.now()) {
    throw new Error('token已过期');
  }
  
  return user;
}

class FeishuSDK {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.tokenCache = null;
    this.tokenExpireTime = 0;
  }
  async getTenantAccessToken() {
    const now = Date.now();
    if (this.tokenCache && now < this.tokenExpireTime) return this.tokenCache;
    const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
    const response = await uniCloud.httpclient.request(url, { method: 'POST', data: { app_id: this.appId, app_secret: this.appSecret }, dataType: 'json', contentType: 'json' });
    if (response.status !== 200 || response.data.code !== 0) throw new Error('获取飞书 token 失败');
    this.tokenCache = response.data.tenant_access_token;
    this.tokenExpireTime = now + (response.data.expire - 300) * 1000;
    return this.tokenCache;
  }
  async getRecords(appToken, tableId, options = {}) {
    const token = await this.getTenantAccessToken();
    const { page_token, page_size = 20, filter, sort } = options;
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
    const params = { page_size };
    if (page_token) params.page_token = page_token;
    if (filter) params.filter = JSON.stringify(filter);
    if (sort) params.sort = JSON.stringify(sort);
    const response = await uniCloud.httpclient.request(url, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` }, data: params, dataType: 'json' });
    if (response.status !== 200 || response.data.code !== 0) throw new Error('获取飞书表格数据失败');
    return response.data.data;
  }
  async getFields(appToken, tableId) {
    const token = await this.getTenantAccessToken();
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`;
    const response = await uniCloud.httpclient.request(url, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` }, dataType: 'json' });
    if (response.status !== 200 || response.data.code !== 0) throw new Error('获取飞书表格字段失败');
    return response.data.data;
  }
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
      const collection = db.collection('feishu-cards');
      
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
      console.error('Feishu card list error:', error);
      return { code: 500, message: error.message };
    }
  },

  // 管理端专用：飞书卡片列表
  async adminListCards(params = {}) {
    try {
      const {
        page = 1,
        page_size = 20,
        navigation_tab,
        search_keyword,
        city_name,
        department,
        is_active
      } = params;

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }
      if (!user.is_admin) {
        return { code: 403, message: '无管理权限' };
      }

      const db = uniCloud.database();
      const dbCmd = db.command;
      const collection = db.collection('feishu-cards');

      let where = {};
      if (typeof is_active === 'boolean') {
        where.is_active = is_active;
      }
      if (navigation_tab && navigation_tab !== 'all') {
        where.navigation_tab = navigation_tab;
      }
      if (city_name) {
        where.cities = dbCmd.in(['all', city_name]);
      }
      if (department) {
        where.departments = dbCmd.in(['all', department]);
      }
      if (search_keyword) {
        const reg = new RegExp(search_keyword, 'i');
        where._id = dbCmd.or([
          { title: reg },
          { description: reg }
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
      console.error('Feishu adminListCards error:', error);
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
      const result = await db.collection('feishu-cards').doc(card_id).get();
      
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
      console.error('Feishu card detail error:', error);
      return { code: 500, message: error.message };
    }
  },

  async fetchTableData(params = {}) {
    try {
      const { card_id, page_token, page_size = 20, filter } = params;
      
      if (!card_id) {
        return { code: 400, message: '缺少 card_id 参数' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      const db = uniCloud.database();
      const result = await db.collection('feishu-cards').doc(card_id).get();
      
      if (!result.data || result.data.length === 0) {
        return { code: 404, message: '飞书卡片不存在' };
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

      // 初始化飞书 SDK
      const feishu = new FeishuSDK(card.app_id, card.app_secret);
      
      // 解析表格 URL 提取 app_token 和 table_id
      const urlMatch = card.table_url.match(/base\/([^?]+)\?table=([^&]+)/);
      if (!urlMatch) {
        return { code: 400, message: '飞书表格 URL 格式错误' };
      }
      
      const [, app_token, table_id] = urlMatch;

      // 获取表格记录
      const records = await feishu.getRecords(app_token, table_id, {
        page_token,
        page_size,
        filter
      });

      return {
        code: 0,
        message: 'success',
        data: records
      };
    } catch (error) {
      console.error('Fetch feishu table data error:', error);
      return { code: 500, message: error.message };
    }
  },

  async getTableFields(params = {}) {
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
      const result = await db.collection('feishu-cards').doc(card_id).get();
      
      if (!result.data || result.data.length === 0) {
        return { code: 404, message: '飞书卡片不存在' };
      }

      const card = result.data[0];

      // 初始化飞书 SDK
      const feishu = new FeishuSDK(card.app_id, card.app_secret);
      
      // 解析表格 URL
      const urlMatch = card.table_url.match(/base\/([^?]+)\?table=([^&]+)/);
      if (!urlMatch) {
        return { code: 400, message: '飞书表格 URL 格式错误' };
      }
      
      const [, app_token, table_id] = urlMatch;

      // 获取字段列表
      const fields = await feishu.getFields(app_token, table_id);

      return {
        code: 0,
        message: 'success',
        data: fields
      };
    } catch (error) {
      console.error('Get feishu table fields error:', error);
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
        return { code: 403, message: '无权限创建飞书卡片' };
      }

      const {
        title,
        description,
        app_id,
        app_secret,
        table_url,
        navigation_tab = '服务',
        cities = ['all'],
        departments = ['all'],
        icon_url,
        display_fields = [],
        filter_config,
        is_active = true,
        sort_order = 0
      } = params;

      if (!title || !app_id || !app_secret || !table_url) {
        return { code: 400, message: '缺少必填字段：title, app_id, app_secret, table_url' };
      }

      const db = uniCloud.database();
      const now = Date.now();
      
      const cardData = {
        title,
        description,
        app_id,
        app_secret,
        table_url,
        navigation_tab,
        cities,
        departments,
        icon_url,
        display_fields,
        filter_config,
        is_active,
        sort_order,
        created_at: now,
        updated_at: now
      };

      const result = await db.collection('feishu-cards').add(cardData);

      return {
        code: 0,
        message: '创建成功',
        data: { id: result.id }
      };
    } catch (error) {
      console.error('Feishu card create error:', error);
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
        return { code: 403, message: '无权限更新飞书卡片' };
      }

      const db = uniCloud.database();
      
      const checkResult = await db.collection('feishu-cards').doc(card_id).get();
      if (!checkResult.data || checkResult.data.length === 0) {
        return { code: 404, message: '飞书卡片不存在' };
      }

      const allowedFields = [
        'title', 'description', 'app_id', 'app_secret', 'table_url',
        'navigation_tab', 'cities', 'departments', 'icon_url',
        'display_fields', 'filter_config', 'is_active', 'sort_order'
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

      await db.collection('feishu-cards').doc(card_id).update(updateObj);

      return {
        code: 0,
        message: '更新成功'
      };
    } catch (error) {
      console.error('Feishu card update error:', error);
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
        return { code: 403, message: '无权限删除飞书卡片' };
      }

      const db = uniCloud.database();
      
      await db.collection('feishu-cards').doc(card_id).update({
        is_active: false,
        updated_at: Date.now()
      });

      return {
        code: 0,
        message: '删除成功'
      };
    } catch (error) {
      console.error('Feishu card delete error:', error);
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
