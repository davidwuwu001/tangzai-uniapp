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

module.exports = {
  _before: function() {
    // 请求拦截器
  },
  
  /**
   * 流式响应 - 新方法
   */
  async sendMessageStream(params = {}) {
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
        let modelResult = await db.collection('models').doc(agent.model_id).get();
        if (!modelResult.data || modelResult.data.length === 0) {
          modelResult = await db.collection('models').where({ original_id: agent.model_id }).get();
        }
        if (modelResult.data && modelResult.data.length > 0) {
          model = modelResult.data[0];
        }
      }

      if (!model) {
        return { code: 400, message: '智能体未配置有效模型' };
      }

      // 构造完整的消息列表
      const fullMessages = [
        { role: 'system', content: agent.system_prompt },
        ...messages
      ];

      let streamUrl = '';
      let requestBody = {};
      let headers = {};

      // 根据模型类型调用不同的 API
      if (model.model_type === 'volcengine') {
        // 火山引擎知识库流式调用
        if (!model.volc_service_id) {
          throw new Error('模型未配置火山引擎服务 ID');
        }
        
        const recentMessages = messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        streamUrl = model.api_url;
        requestBody = {
          service_resource_id: model.volc_service_id,
          messages: recentMessages,
          stream: true  // 开启流式
        };
        headers = {
          'Accept': 'text/event-stream',
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Bearer ${model.api_key}`
        };
      } else {
        // OpenAI 流式调用
        streamUrl = model.api_url;
        requestBody = {
          model: model.name,
          messages: fullMessages,
          max_tokens: parseInt(agent.max_tokens) || 2000,
          temperature: parseFloat(agent.temperature) || 0.7,
          stream: true  // 开启流式
        };
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.api_key}`
        };
      }

      // 返回流式配置，让前端直接调用
      return {
        code: 0,
        message: 'success',
        data: {
          streamUrl,
          requestBody,
          headers,
          model_type: model.model_type
        }
      };
    } catch (error) {
      console.error('Chat sendMessageStream error:', error);
      return { code: 500, message: error.message };
    }
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
        // 先尝试按 _id 查询
        let modelResult = await db.collection('models').doc(agent.model_id).get();
        
        // 如果按 _id 查不到，尝试按 original_id 查询
        if (!modelResult.data || modelResult.data.length === 0) {
          modelResult = await db.collection('models').where({ original_id: agent.model_id }).get();
        }
        
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

      // 根据模型类型调用不同的 API
      if (model.model_type === 'volcengine') {
        // 火山引擎知识库调用
        if (!model.volc_service_id) {
          throw new Error('模型未配置火山引擎服务 ID');
        }
        
        // 支持多轮对话：发送完整的对话历史（最近10轮）
        const recentMessages = messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        if (recentMessages.length === 0) {
          throw new Error('没有找到消息');
        }
        
        const requestBody = {
          service_resource_id: model.volc_service_id,
          messages: recentMessages,  // 发送完整对话历史
          stream: false
        };
        
        console.log('火山引擎 API 请求:', {
          url: model.api_url,
          service_id: model.volc_service_id,
          messagesCount: recentMessages.length
        });
        
        const apiResponse = await uniCloud.httpclient.request(model.api_url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': `Bearer ${model.api_key}`
          },
          data: requestBody,
          dataType: 'json',
          timeout: 600000  // 600秒（10分钟）超时，适合长内容生成
        });
        
        console.log('火山引擎 API 响应状态:', apiResponse.status);
        
        if (apiResponse.status !== 200) {
          console.error('火山引擎 API 错误响应:', apiResponse.data);
          throw new Error(`火山引擎 API 调用失败: ${apiResponse.status}`);
        }
        
        const data = apiResponse.data;
        
        // 火山引擎知识库响应格式
        if (data.code === 0 && data.data && data.data.generated_answer) {
          // 火山引擎知识库标准格式
          response = data.data.generated_answer;
          usage = data.data.token_usage || {};
        } else if (data.choices && data.choices[0] && data.choices[0].message) {
          // OpenAI 格式
          response = data.choices[0].message.content;
          usage = data.usage || {};
        } else if (data.answer) {
          response = data.answer;
          usage = data.usage || {};
        } else if (data.result) {
          response = data.result;
          usage = data.usage || {};
        } else if (typeof data === 'string') {
          response = data;
          usage = {};
        } else {
          console.error('火山引擎 API 响应格式错误:', JSON.stringify(data));
          throw new Error(`响应格式错误，无法解析`);
        }
      } else {
        // OpenAI 兼容 API 调用
        const requestBody = {
          model: model.name,
          messages: fullMessages,
          max_tokens: parseInt(agent.max_tokens) || 2000,
          temperature: parseFloat(agent.temperature) || 0.7
        };
        
        console.log('API 请求:', {
          url: model.api_url,
          model: model.name,
          messagesCount: fullMessages.length
        });
        
        const apiResponse = await uniCloud.httpclient.request(model.api_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${model.api_key}`
          },
          data: requestBody,
          dataType: 'json',
          timeout: 600000  // 600秒（10分钟）超时，适合长内容生成
        });
        
        console.log('API 响应状态:', apiResponse.status);
        
        if (apiResponse.status !== 200) {
          console.error('API 错误响应:', apiResponse.data);
          throw new Error(`API 调用失败: ${apiResponse.status}, 详情: ${JSON.stringify(apiResponse.data)}`);
        }
        
        const data = apiResponse.data;
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('API 响应格式错误:', data);
          throw new Error('响应格式错误');
        }
        
        response = data.choices[0].message.content;
        usage = data.usage || {};
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

  // OpenAI API 调用
  async callOpenAIAPI(agent, model, messages) {
    try {
      const requestBody = {
        model: model.name,
        messages: messages,
        max_tokens: agent.max_tokens || 2000,
        temperature: agent.temperature || 0.7
      };
      
      const response = await uniCloud.httpclient.request(model.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.api_key}`
        },
        data: requestBody,
        dataType: 'json'
      });
      
      if (response.status !== 200) {
        throw new Error(`API 调用失败: ${response.status}`);
      }
      
      const data = response.data;
      
      return {
        response: data.choices[0].message.content,
        usage: data.usage || {}
      };
    } catch (error) {
      console.error('OpenAI API 调用错误:', error);
      throw new Error(`API 调用失败: ${error.message}`);
    }
  },

  // 火山引擎 API 调用（预留实现）
  async callVolcengineAPI(agent, model, messages) {
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
