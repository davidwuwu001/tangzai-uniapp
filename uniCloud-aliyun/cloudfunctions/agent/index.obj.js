// 获取当前登录用户信息
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
      const { page = 1, page_size = 10, navigation_tab, search_keyword } = params;
      
      // 获取当前用户权限信息
      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      const db = uniCloud.database();
      const dbCmd = db.command;
      const agentCollection = db.collection('agents');
      
      // 构建查询条件
      let where = { is_active: true };
      
      // 导航标签筛选
      if (navigation_tab && navigation_tab !== 'all') {
        where.navigation_tab = navigation_tab;
      }
      
      // 关键词搜索（名称或描述）
      if (search_keyword) {
        where._id = dbCmd.or([
          { name: new RegExp(search_keyword, 'i') },
          { description: new RegExp(search_keyword, 'i') }
        ]);
      }
      
      // 权限过滤：非管理员只能看到自己城市/部门的智能体
      if (!user.is_admin) {
        where._id = dbCmd.or([
          { cities: dbCmd.in(['all', user.city_name]) },
          { departments: dbCmd.in(['all', user.department_name]) }
        ]);
      }

      // 分页查询
      const skip = (page - 1) * page_size;
      const result = await agentCollection
        .where(where)
        .orderBy('created_at', 'desc')
        .skip(skip)
        .limit(page_size)
        .get();

      // 获取总数
      const countResult = await agentCollection.where(where).count();
      
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
      console.error('Agent list error:', error);
      return { code: 500, message: error.message };
    }
  },

  async detail(params = {}) {
    try {
      const { agent_id } = params;
      
      if (!agent_id) {
        return { code: 400, message: '缺少 agent_id 参数' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      const db = uniCloud.database();
      const result = await db.collection('agents').doc(agent_id).get();
      
      if (!result.data || result.data.length === 0) {
        return { code: 404, message: '智能体不存在' };
      }

      const agent = result.data[0];
      
      // 权限检查：非管理员只能查看自己权限范围内的智能体
      if (!user.is_admin) {
        const hasPermission = 
          agent.cities.includes('all') || 
          agent.cities.includes(user.city_name) ||
          agent.departments.includes('all') || 
          agent.departments.includes(user.department_name);
        
        if (!hasPermission) {
          return { code: 403, message: '无权限访问该智能体' };
        }
      }

      // 关联查询模型信息
      if (agent.model_id) {
        const modelResult = await db.collection('models').doc(agent.model_id).get();
        if (modelResult.data && modelResult.data.length > 0) {
          agent.model = modelResult.data[0];
        }
      }

      return {
        code: 0,
        message: 'success',
        data: agent
      };
    } catch (error) {
      console.error('Agent detail error:', error);
      return { code: 500, message: error.message };
    }
  },

  async create(params = {}) {
    try {
      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      // 只有管理员可以创建智能体
      if (!user.is_admin) {
        return { code: 403, message: '无权限创建智能体' };
      }

      const {
        name,
        description,
        system_prompt,
        max_tokens = 2000,
        temperature = 0.7,
        model_id,
        navigation_tab = '教研',
        cities = ['all'],
        departments = ['all'],
        agent_type = 'openai',
        volc_service_id,
        volc_config,
        icon_name = 'Bot',
        icon_type = 'builtin',
        icon_color = '#6366f1',
        is_active = true
      } = params;

      // 必填字段验证
      if (!name || !system_prompt) {
        return { code: 400, message: '缺少必填字段：name, system_prompt' };
      }

      const db = uniCloud.database();
      const now = Date.now();
      
      const agentData = {
        name,
        description,
        system_prompt,
        max_tokens,
        temperature,
        model_id,
        navigation_tab,
        cities,
        departments,
        agent_type,
        volc_service_id,
        volc_config,
        icon_name,
        icon_type,
        icon_color,
        is_active,
        created_at: now,
        updated_at: now
      };

      const result = await db.collection('agents').add(agentData);

      return {
        code: 0,
        message: '创建成功',
        data: { id: result.id }
      };
    } catch (error) {
      console.error('Agent create error:', error);
      return { code: 500, message: error.message };
    }
  },

  async update(params = {}) {
    try {
      const { agent_id, ...updateData } = params;
      
      if (!agent_id) {
        return { code: 400, message: '缺少 agent_id 参数' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      // 只有管理员可以更新智能体
      if (!user.is_admin) {
        return { code: 403, message: '无权限更新智能体' };
      }

      const db = uniCloud.database();
      
      // 检查智能体是否存在
      const checkResult = await db.collection('agents').doc(agent_id).get();
      if (!checkResult.data || checkResult.data.length === 0) {
        return { code: 404, message: '智能体不存在' };
      }

      // 允许更新的字段
      const allowedFields = [
        'name', 'description', 'system_prompt', 'max_tokens', 'temperature',
        'model_id', 'navigation_tab', 'cities', 'departments', 'agent_type',
        'volc_service_id', 'volc_config', 'icon_name', 'icon_type',
        'icon_color', 'is_active'
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

      await db.collection('agents').doc(agent_id).update(updateObj);

      return {
        code: 0,
        message: '更新成功'
      };
    } catch (error) {
      console.error('Agent update error:', error);
      return { code: 500, message: error.message };
    }
  },

  async delete(params = {}) {
    try {
      const { agent_id } = params;
      
      if (!agent_id) {
        return { code: 400, message: '缺少 agent_id 参数' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      // 只有管理员可以删除智能体
      if (!user.is_admin) {
        return { code: 403, message: '无权限删除智能体' };
      }

      const db = uniCloud.database();
      
      // 软删除：设置 is_active 为 false
      await db.collection('agents').doc(agent_id).update({
        is_active: false,
        updated_at: Date.now()
      });

      return {
        code: 0,
        message: '删除成功'
      };
    } catch (error) {
      console.error('Agent delete error:', error);
      return { code: 500, message: error.message };
    }
  },

  _after: function(error, result) {
    // 响应拦截器
    if (error) {
      return { code: 500, message: error.message };
    }
    return result;
  }
};
