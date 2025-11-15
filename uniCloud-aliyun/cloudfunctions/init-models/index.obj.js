/**
 * 初始化 models 表
 */

const db = uniCloud.database();

module.exports = {
  async init() {
    const collection = db.collection('models');
    
    // 检查是否已有数据
    const countRes = await collection.count();
    if (countRes.total > 0) {
      return {
        code: 0,
        message: `models 表已有 ${countRes.total} 条数据，无需初始化`
      };
    }
    
    // 初始化测试模型数据
    const models = [
      {
        name: 'GPT-3.5 Turbo',
        model_name: 'gpt-3.5-turbo',
        provider: 'openai',
        api_base_url: 'https://api.openai.com/v1',
        api_key: 'YOUR_API_KEY_HERE',
        max_tokens: 4096,
        is_active: true,
        description: 'OpenAI GPT-3.5 Turbo 模型',
        created_at: Date.now(),
        updated_at: Date.now()
      },
      {
        name: '火山方舟-测试模型',
        model_name: 'doubao-pro-128k',
        provider: 'volcengine',
        api_base_url: '',
        api_key: '',
        max_tokens: 128000,
        is_active: true,
        description: '火山方舟豆包模型',
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ];
    
    const res = await collection.add(models);
    
    return {
      code: 0,
      message: `成功初始化 ${models.length} 个模型`,
      data: {
        inserted: models.length,
        ids: res.ids || []
      }
    };
  },
  
  async list() {
    const collection = db.collection('models');
    const res = await collection.get();
    
    return {
      code: 0,
      data: {
        list: res.data,
        total: res.data.length
      }
    };
  }
};
