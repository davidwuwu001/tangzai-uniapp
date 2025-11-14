
// 自动化导入脚本
// 需要先配置 uniCloud SDK

const uniCloud = require('@dcloudio/uni-cloud');

uniCloud.init({
  spaceId: 'your-space-id',  // 替换为你的服务空间 ID
  clientSecret: 'your-client-secret'  // 替换为你的客户端密钥
});

async function importAll() {
  const mappings = [
  {
    "file": "cities.json",
    "collection": "cities"
  },
  {
    "file": "departments.json",
    "collection": "departments"
  },
  {
    "file": "models.json",
    "collection": "models"
  },
  {
    "file": "users.json",
    "collection": "uni-id-users"
  },
  {
    "file": "agents.json",
    "collection": "agents"
  },
  {
    "file": "web-cards.json",
    "collection": "web-cards"
  },
  {
    "file": "feishu-cards.json",
    "collection": "feishu-cards"
  }
];
  
  for (const mapping of mappings) {
    const data = require('../data-export/' + mapping.file);
    
    console.log(`导入 ${mapping.collection}...`);
    
    const res = await uniCloud.callFunction({
      name: 'data-import',
      data: {
        collection: mapping.collection,
        data: data,
        clearBefore: true
      }
    });
    
    console.log(`结果:`, res);
  }
}

importAll().catch(console.error);
