/**
 * 更新智能体关联模型
 */

const db = uniCloud.database();

module.exports = {
  /**
   * 为所有智能体配置模型
   * @param {string} modelId - 模型 ID（可选）
   */
  async updateAll(params = {}) {
    const { modelId } = params;
    
    // 如果没有指定模型ID，查找第一个激活的模型
    let targetModelId = modelId;
    
    if (!targetModelId) {
      const modelRes = await db.collection('models')
        .where({ is_active: true })
        .limit(1)
        .get();
      
      if (modelRes.data.length === 0) {
        return {
          code: 400,
          message: '没有找到可用的模型，请先初始化 models 表'
        };
      }
      
      targetModelId = modelRes.data[0]._id;
    }
    
    // 更新所有没有配置模型的智能体
    const agentCollection = db.collection('agents');
    
    // 先查询需要更新的智能体
    const agentsToUpdate = await agentCollection
      .where(db.command.or([
        { model_id: db.command.exists(false) },
        { model_id: null },
        { model_id: '' }
      ]))
      .get();
    
    if (agentsToUpdate.data.length === 0) {
      return {
        code: 0,
        message: '所有智能体都已配置模型',
        data: { updated: 0 }
      };
    }
    
    // 批量更新
    const updates = agentsToUpdate.data.map(agent => {
      return agentCollection.doc(agent._id).update({
        model_id: targetModelId,
        updated_at: Date.now()
      });
    });
    
    await Promise.all(updates);
    
    return {
      code: 0,
      message: `成功为 ${agentsToUpdate.data.length} 个智能体配置模型`,
      data: {
        updated: agentsToUpdate.data.length,
        model_id: targetModelId
      }
    };
  },
  
  /**
   * 查看智能体的模型配置情况
   */
  async check() {
    const agentCollection = db.collection('agents');
    
    const allAgents = await agentCollection.get();
    
    const withModel = allAgents.data.filter(a => a.model_id);
    const withoutModel = allAgents.data.filter(a => !a.model_id);
    
    return {
      code: 0,
      data: {
        total: allAgents.data.length,
        with_model: withModel.length,
        without_model: withoutModel.length,
        agents: allAgents.data.map(a => ({
          _id: a._id,
          name: a.name,
          model_id: a.model_id || '未配置'
        }))
      }
    };
  }
};
