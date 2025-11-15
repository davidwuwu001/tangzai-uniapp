// 诊断智能体数据
'use strict';

module.exports = {
  async check() {
    try {
      const db = uniCloud.database();
      
      // 1. 查询所有智能体（不加任何条件）
      const allAgents = await db.collection('agents').get();
      console.log('所有智能体数量:', allAgents.data.length);
      
      // 2. 查询is_active=true的智能体
      const activeAgents = await db.collection('agents').where({ is_active: true }).get();
      console.log('激活的智能体数量:', activeAgents.data.length);
      
      // 3. 返回详细信息
      return {
        code: 0,
        message: '诊断完成',
        data: {
          total: allAgents.data.length,
          active: activeAgents.data.length,
          allAgents: allAgents.data.map(a => ({
            _id: a._id,
            name: a.name,
            is_active: a.is_active,
            cities: a.cities,
            departments: a.departments,
            created_at: a.created_at
          })),
          activeAgents: activeAgents.data.map(a => ({
            _id: a._id,
            name: a.name,
            is_active: a.is_active,
            cities: a.cities,
            departments: a.departments
          }))
        }
      };
    } catch (error) {
      console.error('诊断失败:', error);
      return {
        code: 500,
        message: error.message || '诊断失败'
      };
    }
  }
};
