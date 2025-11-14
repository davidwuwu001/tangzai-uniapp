// 数据关联修复云函数
// 用途：修复导入后 ID 变化导致的关联问题
'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  
  console.log('开始修复数据关联...');
  
  try {
    // 1. 获取所有 models，建立 name 到新 _id 的映射
    const modelsRes = await db.collection('models').get();
    const models = modelsRes.data;
    
    console.log(`找到 ${models.length} 个模型`);
    
    // 建立映射：model name -> 新的 _id
    const modelNameToId = {};
    models.forEach(model => {
      modelNameToId[model.name] = model._id;
    });
    
    console.log('模型映射:', modelNameToId);
    
    // 2. 获取所有 agents
    const agentsRes = await db.collection('agents').get();
    const agents = agentsRes.data;
    
    console.log(`找到 ${agents.length} 个智能体`);
    
    // 3. 更新 agents 的 model_id
    let updated = 0;
    let skipped = 0;
    let errors = [];
    
    for (const agent of agents) {
      try {
        // 如果 model_id 为空或 null，跳过
        if (!agent.model_id) {
          console.log(`跳过 ${agent.name}：没有 model_id`);
          skipped++;
          continue;
        }
        
        // 从 model_id 中提取模型名称
        // 例如：model_id 可能是 "model_8" 或已经是新ID
        let modelName = null;
        
        // 尝试匹配模型名称
        for (const name in modelNameToId) {
          // 如果当前 model_id 包含模型名称的一部分
          if (agent.model_id.includes(name) || name.includes(agent.model_id)) {
            modelName = name;
            break;
          }
        }
        
        // 如果找不到，尝试通过 models 列表查找
        if (!modelName) {
          // 检查是否已经是正确的新ID
          const existingModel = models.find(m => m._id === agent.model_id);
          if (existingModel) {
            console.log(`${agent.name} 的 model_id 已经是正确的`);
            skipped++;
            continue;
          }
          
          console.log(`警告: 无法为 ${agent.name} 找到匹配的模型 (model_id: ${agent.model_id})`);
          errors.push({
            agent: agent.name,
            old_model_id: agent.model_id,
            reason: '找不到匹配的模型'
          });
          skipped++;
          continue;
        }
        
        const newModelId = modelNameToId[modelName];
        
        console.log(`更新 ${agent.name}: ${agent.model_id} -> ${newModelId}`);
        
        // 更新 agent 的 model_id
        await db.collection('agents').doc(agent._id).update({
          model_id: newModelId
        });
        
        updated++;
        
      } catch (error) {
        console.error(`更新 ${agent.name} 失败:`, error);
        errors.push({
          agent: agent.name,
          error: error.message
        });
      }
    }
    
    return {
      code: 0,
      message: '关联修复完成',
      summary: {
        total: agents.length,
        updated: updated,
        skipped: skipped,
        errors: errors.length
      },
      errors: errors
    };
    
  } catch (error) {
    console.error('修复失败:', error);
    return {
      code: 500,
      message: error.message
    };
  }
};
