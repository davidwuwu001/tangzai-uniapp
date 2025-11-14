// HTTP 云函数 - 数据导入
// 用途：通过 HTTP 请求批量导入数据
'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  
  // 解析 HTTP 请求
  let params;
  
  try {
    // 如果是 HTTP 请求，event.body 是字符串
    if (event.body) {
      params = JSON.parse(event.body);
    } else {
      params = event;
    }
  } catch (error) {
    return {
      code: 400,
      message: '参数解析失败',
      error: error.message
    };
  }
  
  const { collection, data, clearBefore, token } = params;
  
  // 简单的安全验证（可选）
  const IMPORT_TOKEN = 'tangzai-import-2025'; // 简单的访问令牌
  if (token !== IMPORT_TOKEN) {
    return {
      code: 403,
      message: '无效的访问令牌',
      help: '请在参数中包含正确的 token'
    };
  }
  
  // 参数验证
  if (!collection) {
    return {
      code: 400,
      message: '缺少 collection 参数'
    };
  }
  
  if (!data || !Array.isArray(data)) {
    return {
      code: 400,
      message: 'data 参数必须是数组',
      dataType: typeof data
    };
  }
  
  if (data.length === 0) {
    return {
      code: 400,
      message: 'data 数组为空'
    };
  }
  
  console.log(`开始导入数据到 ${collection}，数量: ${data.length}`);
  
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
    
    // 批量导入数据
    const batchSize = 100;
    let inserted = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        await db.collection(collection).add(batch);
        inserted += batch.length;
        console.log(`批次 ${Math.floor(i / batchSize) + 1}: 成功插入 ${batch.length} 条`);
      } catch (batchError) {
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
      errors: errors.length > 0 ? errors.slice(0, 10) : []
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
