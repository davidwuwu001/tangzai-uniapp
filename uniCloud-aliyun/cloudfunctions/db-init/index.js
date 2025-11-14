// 数据库初始化云函数
// 使用方法：在 HBuilderX 中右键运行此云函数
'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const dbCmd = db.command;
  
  const results = {
    success: [],
    failed: [],
    skipped: []
  };
  
  // 定义需要创建的集合列表
  const collections = [
    'uni-id-users',
    'agents',
    'web-cards',
    'feishu-cards',
    'departments',
    'cities',
    'models',
    'chat-history'
  ];
  
  console.log('开始检查和创建数据库集合...');
  
  for (const collectionName of collections) {
    try {
      console.log(`正在创建表: ${collectionName}...`);
      
      // 直接插入一条临时数据来触发表创建
      const addRes = await db.collection(collectionName).add({
        _temp_init: true,
        _init_time: Date.now(),
        _note: '初始化临时数据，将被删除'
      });
      
      console.log(`✓ 表 ${collectionName} 创建成功，临时ID: ${addRes.id}`);
      
      // 立即删除临时数据
      await db.collection(collectionName).doc(addRes.id).remove();
      
      results.success.push(`${collectionName} - 已创建`);
      console.log(`✓ ${collectionName} 临时数据已清理`);
      
    } catch (error) {
      console.error(`✗ ${collectionName} 创建失败:`, error.message);
      results.failed.push(`${collectionName} - ${error.message}`);
    }
  }
  
  // 返回执行结果
  return {
    code: 0,
    message: '数据库初始化完成',
    results: results,
    summary: {
      total: collections.length,
      success: results.success.length,
      skipped: results.skipped.length,
      failed: results.failed.length
    }
  };
};
