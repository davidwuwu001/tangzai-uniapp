/**
 * 检查数据 - 无需登录验证
 */

const db = uniCloud.database();

module.exports = {
  _before: function() {
    // 跳过身份验证
  },
  
  async checkModels() {
    try {
      const res = await db.collection('models').get();
      return {
        code: 0,
        data: res.data
      };
    } catch (error) {
      return {
        code: 500,
        message: error.message
      };
    }
  },
  
  async checkAgents() {
    try {
      const res = await db.collection('agents').get();
      
      // 只返回关键信息
      const formatted = res.data.map(a => ({
        _id: a._id,
        name: a.name,
        model_id: a.model_id || null,
        agent_type: a.agent_type
      }));
      
      return {
        code: 0,
        data: formatted
      };
    } catch (error) {
      return {
        code: 500,
        message: error.message
      };
    }
  },
  
  async checkRelation() {
    try {
      // 获取所有智能体和模型
      const agents = await db.collection('agents').get();
      const models = await db.collection('models').get();
      
      // 检查关联关系
      const modelIds = models.data.map(m => m._id);
      
      const result = agents.data.map(a => {
        const hasValidModel = a.model_id && modelIds.includes(a.model_id);
        return {
          agent_name: a.name,
          model_id: a.model_id || '未配置',
          is_valid: hasValidModel,
          status: hasValidModel ? '✓ 正常' : '✗ 无效或未配置'
        };
      });
      
      return {
        code: 0,
        data: {
          total_agents: agents.data.length,
          total_models: models.data.length,
          model_ids: modelIds,
          agents: result
        }
      };
    } catch (error) {
      return {
        code: 500,
        message: error.message
      };
    }
  }
};
