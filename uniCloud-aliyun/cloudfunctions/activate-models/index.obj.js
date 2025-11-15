/**
 * 激活所有模型
 */

const db = uniCloud.database();

module.exports = {
  async activateAll() {
    try {
      // 获取所有模型
      const models = await db.collection('models').get();
      
      if (models.data.length === 0) {
        return {
          code: 400,
          message: '没有找到任何模型'
        };
      }
      
      // 批量更新所有模型为激活状态
      const updates = models.data.map(model => {
        return db.collection('models').doc(model._id).update({
          is_active: true,
          updated_at: Date.now()
        });
      });
      
      await Promise.all(updates);
      
      return {
        code: 0,
        message: `成功激活 ${models.data.length} 个模型`,
        data: {
          count: models.data.length
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
