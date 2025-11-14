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

  async sendMessage(params = {}) {
    try {
      const { agent_id, messages } = params;
      
      if (!agent_id || !messages || !Array.isArray(messages)) {
        return { code: 400, message: '缺少必填参数：agent_id, messages' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      const db = uniCloud.database();
      
      // 获取智能体配置
      const agentResult = await db.collection('agents').doc(agent_id).get();
      if (!agentResult.data || agentResult.data.length === 0) {
        return { code: 404, message: '智能体不存在' };
      }

      const agent = agentResult.data[0];
      
      // 权限检查
      if (!user.is_admin) {
        const hasPermission = 
          agent.cities.includes('all') || 
          agent.cities.includes(user.city_name) ||
          agent.departments.includes('all') || 
          agent.departments.includes(user.department_name);
        
        if (!hasPermission) {
          return { code: 403, message: '无权限使用该智能体' };
        }
      }

      // 获取关联的模型信息
      let model = null;
      if (agent.model_id) {
        const modelResult = await db.collection('models').doc(agent.model_id).get();
        if (modelResult.data && modelResult.data.length > 0) {
          model = modelResult.data[0];
        }
      }

      if (!model) {
        return { code: 400, message: '智能体未配置有效模型' };
      }

      // 构造完整的消息列表（system + user messages）
      const fullMessages = [
        { role: 'system', content: agent.system_prompt },
        ...messages
      ];

      let response = '';
      let usage = {};

      // 根据智能体类型调用不同的 API
      if (agent.agent_type === 'volcengine') {
        // 火山引擎调用（预留接口）
        const volcResult = await this._callVolcengineAPI(agent, model, fullMessages);
        response = volcResult.response;
        usage = volcResult.usage;
      } else {
        // OpenAI 兼容 API 调用（预留接口）
        const openaiResult = await this._callOpenAIAPI(agent, model, fullMessages);
        response = openaiResult.response;
        usage = openaiResult.usage;
      }

      // 保存对话历史
      const now = Date.now();
      await db.collection('chat-history').add({
        user_id: user._id,
        agent_id,
        messages: fullMessages,
        response,
        usage,
        created_at: now
      });

      return {
        code: 0,
        message: 'success',
        data: {
          response,
          usage
        }
      };
    } catch (error) {
      console.error('Chat sendMessage error:', error);
      return { code: 500, message: error.message };
    }
  },

  async getHistory(params = {}) {
    try {
      const { agent_id, page = 1, page_size = 20 } = params;
      
      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      const db = uniCloud.database();
      const dbCmd = db.command;
      
      let where = { user_id: user._id };
      if (agent_id) {
        where.agent_id = agent_id;
      }

      const skip = (page - 1) * page_size;
      const result = await db.collection('chat-history')
        .where(where)
        .orderBy('created_at', 'desc')
        .skip(skip)
        .limit(page_size)
        .get();

      const countResult = await db.collection('chat-history').where(where).count();

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
      console.error('Chat getHistory error:', error);
      return { code: 500, message: error.message };
    }
  },

  async deleteHistory(params = {}) {
    try {
      const { history_id } = params;
      
      if (!history_id) {
        return { code: 400, message: '缺少 history_id 参数' };
      }

      const user = await getCurrentUser(this.getUniIdToken());
      if (!user) {
        return { code: 401, message: '未登录或登录已过期' };
      }

      const db = uniCloud.database();
      
      // 检查记录是否属于当前用户
      const result = await db.collection('chat-history').doc(history_id).get();
      if (!result.data || result.data.length === 0) {
        return { code: 404, message: '对话记录不存在' };
      }

      if (result.data[0].user_id !== user._id && !user.is_admin) {
        return { code: 403, message: '无权限删除该对话记录' };
      }

      await db.collection('chat-history').doc(history_id).remove();

      return {
        code: 0,
        message: '删除成功'
      };
    } catch (error) {
      console.error('Chat deleteHistory error:', error);
      return { code: 500, message: error.message };
    }
  },

  // OpenAI API 调用（预留实现）
  async _callOpenAIAPI(agent, model, messages) {
    // TODO: 实现 OpenAI API 调用
    // 1. 使用 model.api_base_url 和 model.api_key
    // 2. 调用 POST {api_base_url}/chat/completions
    // 3. 传入 model.model_name, messages, agent.max_tokens, agent.temperature
    // 4. 解析响应返回 { response, usage }
    
    throw new Error('OpenAI API 调用功能待实现');
  },

  // 火山引擎 API 调用（预留实现）
  async _callVolcengineAPI(agent, model, messages) {
    // TODO: 实现火山引擎 API 调用
    // 1. 使用 agent.volc_service_id 和模型配置
    // 2. 调用火山方舟 API
    // 3. 支持知识库检索（如果配置）
    // 4. 返回 { response, usage }
    
    throw new Error('火山引擎 API 调用功能待实现');
  },

  _after: function(error, result) {
    if (error) {
      return { code: 500, message: error.message };
    }
    return result;
  }
};
