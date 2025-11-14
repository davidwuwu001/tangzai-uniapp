// 数据导入云函数
// 用途：批量导入 JSON 数据到 uniCloud 数据库
'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  
  // 参数验证
  console.log('接收到的参数:', JSON.stringify(event).substring(0, 200));
  
  if (!event || typeof event !== 'object') {
    return {
      code: 400,
      message: '参数格式错误：event 必须是一个对象',
      help: '请确保在参数框中粘贴了完整的 JSON 对象，格式如：{"collection":"cities","data":[...],"clearBefore":true}'
    };
  }
  
  const { collection, data, clearBefore } = event;
  
  if (!collection) {
    return {
      code: 400,
      message: '缺少 collection 参数',
      receivedParams: Object.keys(event),
      help: '请确保参数中包含 collection 字段'
    };
  }
  
  if (!data || !Array.isArray(data)) {
    return {
      code: 400,
      message: 'data 参数必须是数组',
      dataType: typeof data,
      dataValue: data,
      help: '请确保参数中包含 data 字段，且是一个数组'
    };
  }
  
  if (data.length === 0) {
    return {
      code: 400,
      message: 'data 数组为空，没有数据可导入',
      help: '请检查参数文件是否正确'
    };
  }
  
  console.log(`开始导入数据到 ${collection}...`);
  console.log(`数据条数: ${data.length}`);
  
  try {
    // 如果需要，先清空现有数据
    if (clearBefore) {
      console.log(`清空 ${collection} 现有数据...`);
      const countRes = await db.collection(collection).count();
      if (countRes.total > 0) {
        await db.collection(collection).where({ _id: db.command.exists(true) }).remove();
        console.log(`已清空 ${countRes.total} 条记录`);
      }
    }
    
    // 批量导入数据 (每次最多 100 条)
    const batchSize = 100;
    let inserted = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        // 尝试批量插入
        await db.collection(collection).add(batch);
        inserted += batch.length;
        console.log(`批次 ${Math.floor(i / batchSize) + 1}: 成功插入 ${batch.length} 条`);
      } catch (batchError) {
        // 如果批量插入失败，尝试逐条插入
        console.log(`批次插入失败，尝试逐条插入...`);
        
        for (const item of batch) {
          try {
            await db.collection(collection).add(item);
            inserted++;
          } catch (itemError) {
            failed++;
            errors.push({
              _id: item._id,
              error: itemError.message
            });
            console.error(`插入失败 [${item._id}]:`, itemError.message);
          }
        }
      }
    }
    
    const result = {
      code: 0,
      message: '数据导入完成',
      collection: collection,
      total: data.length,
      inserted: inserted,
      failed: failed,
      errors: errors.length > 0 ? errors.slice(0, 10) : [] // 只返回前10个错误
    };
    
    console.log(`导入完成: 成功 ${inserted} 条，失败 ${failed} 条`);
    
    return result;
    
  } catch (error) {
    console.error('导入错误:', error);
    return {
      code: 500,
      message: error.message,
      collection: collection
    };
  }
};
