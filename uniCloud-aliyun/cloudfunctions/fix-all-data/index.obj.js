// 修复所有数据库集合的嵌套data结构
'use strict';

module.exports = {
  async fix() {
    try {
      const db = uniCloud.database();
      const results = {
        'uni-id-users': { total: 0, fixed: 0, skipped: 0 },
        agents: { total: 0, fixed: 0, skipped: 0 },
        'feishu-cards': { total: 0, fixed: 0, skipped: 0 },
        'web-cards': { total: 0, fixed: 0, skipped: 0 },
        cities: { total: 0, fixed: 0, skipped: 0 },
        departments: { total: 0, fixed: 0, skipped: 0 },
        models: { total: 0, fixed: 0, skipped: 0 }
      };
      
      // 修夏uni-id-users表
      console.log('开始修夏uni-id-users表...');
      await fixCollection(db, 'uni-id-users', results['uni-id-users']);
      
      // 修夏agents表
      console.log('开始修夏agents表...');
      await fixCollection(db, 'agents', results.agents);
      
      // 修夏feishu-cards表
      console.log('开始修夏feishu-cards表...');
      await fixCollection(db, 'feishu-cards', results['feishu-cards']);
      
      // 修夏web-cards表
      console.log('开始修夏web-cards表...');
      await fixCollection(db, 'web-cards', results['web-cards']);
      
      // 修夏cities表
      console.log('开始修夏cities表...');
      await fixCollection(db, 'cities', results.cities);
      
      // 修夏departments表
      console.log('开始修夏departments表...');
      await fixCollection(db, 'departments', results.departments);
      
      // 修夏models表
      console.log('开始修夏models表...');
      await fixCollection(db, 'models', results.models);
      
      return {
        code: 0,
        message: '数据修复完成',
        data: results
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

async function fixCollection(db, collectionName, result) {
  const collection = db.collection(collectionName);
  
  // 获取所有记录
  const allRecords = await collection.get();
  result.total = allRecords.data.length;
  
  console.log(`${collectionName}表共有${result.total}条记录`);
  
  for (const record of allRecords.data) {
    // 检查是否有嵌套的data数组结构
    if (record.data && Array.isArray(record.data) && record.data.length > 0) {
      console.log(`发现嵌套结构，记录ID: ${record._id}, 包含${record.data.length}个子项`);
      
      // 删除包装记录
      await collection.doc(record._id).remove();
      
      // 插入展开的数据
      for (const item of record.data) {
        // 先检查是否已存在（通过_id）
        if (item._id) {
          const exists = await collection.doc(item._id).get();
          if (exists.data && exists.data.length > 0) {
            console.log(`跳过已存在的记录: ${item._id}`);
            result.skipped++;
            continue;
          }
        }
        
        // 准备新记录，不包含_id（让数据库自动生成）
        const newItem = {
          original_id: item._id, // 保存原_id作为参考
          ...item,
          is_active: item.is_active !== undefined ? item.is_active : true,
          created_at: item.created_at || Date.now(),
          updated_at: Date.now()
        };
        
        // 删除_id字段，让数据库生成新的
        delete newItem._id;
        
        await collection.add(newItem);
        
        result.fixed++;
        console.log(`已添加记录: ${item.name || item.username || item.title || item._id}`);
      }
    } else {
      // 正常结构，跳过
      result.skipped++;
    }
  }
  
  console.log(`${collectionName}修复完成: 总计${result.total}, 修复${result.fixed}, 跳过${result.skipped}`);
}
