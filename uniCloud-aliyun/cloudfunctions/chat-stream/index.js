'use strict';

async function getCurrentUser(token, db) {
  if (!token) throw new Error('未登录或登录已过期');
  
  const userRes = await db.collection('uni-id-users')
    .where({ token: token })
    .field({ _id: true, username: true, city_name: true, department_name: true, is_admin: true, token_expired: true })
    .get();
  
  if (!userRes.data || userRes.data.length === 0) {
    throw new Error('未登录或登录已过期');
  }
  
  const user = userRes.data[0];
  
  if (user.token_expired && user.token_expired < Date.now()) {
    throw new Error('token已过期');
  }
  
  return user;
}

exports.main = async (event, context) => {
  const response = context.response;
  
  try {
    // 解析请求参数
    const { agent_id, messages, uniIdToken } = event;
    
    if (!agent_id || !messages || !Array.isArray(messages)) {
      response.setStatusCode(400);
      response.setHeader('Content-Type', 'application/json');
      response.send(JSON.stringify({ code: 400, message: '缺少必填参数' }));
      return;
    }
    
    const db = uniCloud.database();
    
    // 验证用户身份
    const user = await getCurrentUser(uniIdToken, db);
    
    // 获取智能体配置
    const agentResult = await db.collection('agents').doc(agent_id).get();
    if (!agentResult.data || agentResult.data.length === 0) {
      throw new Error('智能体不存在');
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
        throw new Error('无权限使用该智能体');
      }
    }
    
    // 获取模型配置
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
      throw new Error('智能体未配置有效模型');
    }
    
    // 设置 SSE 响应头
    response.setStatusCode(200);
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
    
    // 构造消息列表
    const fullMessages = [
      { role: 'system', content: agent.system_prompt },
      ...messages
    ];
    
    // 根据模型类型调用 API
    let apiResponse;
    
    if (model.model_type === 'volcengine') {
      // 火山引擎流式调用
      if (!model.volc_service_id) {
        throw new Error('模型未配置火山引擎服务 ID');
      }
      
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      apiResponse = await uniCloud.httpclient.request(model.api_url, {
        method: 'POST',
        headers: {
          'Accept': 'text/event-stream',
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Bearer ${model.api_key}`
        },
        data: {
          service_resource_id: model.volc_service_id,
          messages: recentMessages,
          stream: true
        },
        timeout: 600000,
        dataType: 'stream'
      });
    } else {
      // OpenAI 流式调用
      apiResponse = await uniCloud.httpclient.request(model.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.api_key}`
        },
        data: {
          model: model.name,
          messages: fullMessages,
          max_tokens: parseInt(agent.max_tokens) || 2000,
          temperature: parseFloat(agent.temperature) || 0.7,
          stream: true
        },
        timeout: 600000,
        dataType: 'stream'
      });
    }
    
    // 转发流式数据
    apiResponse.res.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          
          // 结束标志
          if (data === '[DONE]') {
            response.write('data: [DONE]\n\n');
            continue;
          }
          
          try {
            // 转发原始数据
            response.write(`data: ${data}\n\n`);
          } catch (e) {
            console.error('解析错误:', e);
          }
        }
      }
    });
    
    apiResponse.res.on('end', () => {
      response.write('data: [DONE]\n\n');
      response.end();
    });
    
    apiResponse.res.on('error', (err) => {
      console.error('Stream error:', err);
      response.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      response.end();
    });
    
  } catch (error) {
    console.error('Chat stream error:', error);
    response.setStatusCode(500);
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify({ code: 500, message: error.message }));
  }
};
