// 修复智能体数据 - 添加is_active字段
'use strict';

module.exports = {
  async fix() {
    try {
      const db = uniCloud.database();
      const agentsCollection = db.collection('agents');
      
      // 查询所有智能体
      const allAgents = await agentsCollection.get();
      console.log('数据库中智能体总数:', allAgents.data.length);
      
      if (allAgents.data.length === 0) {
        return {
          code: 0,
          message: '数据库中没有智能体数据'
        };
      }
      
      // 批量更新，添加is_active字段
      let updateCount = 0;
      for (const agent of allAgents.data) {
        console.log('处理智能体:', agent.name || agent._id);
        
        const updateData = {
          is_active: true,
          updated_at: Date.now()
        };
        
        // 如果没有created_at，也添加
        if (!agent.created_at) {
          updateData.created_at = Date.now();
        }
        
        // 如果没有cities，添加默认值
        if (!agent.cities || agent.cities.length === 0) {
          updateData.cities = ['all'];
        }
        
        // 如果没有departments，添加默认值
        if (!agent.departments || agent.departments.length === 0) {
          updateData.departments = ['all'];
        }
        
        await agentsCollection.doc(agent._id).update(updateData);
        updateCount++;
      }
      
      return {
        code: 0,
        message: `成功修复 ${updateCount} 个智能体`,
        data: {
          total: allAgents.data.length,
          updated: updateCount
        }
      };
      
    } catch (error) {
      console.error('修复失败:', error);
      return {
        code: 500,
        message: error.message || '修复失败'
      };
    }
  }
};
