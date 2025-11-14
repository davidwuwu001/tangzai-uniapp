// 自动导入数据到 uniCloud 的脚本
// 用途：读取导出的 JSON 文件并通过云函数导入到 uniCloud

const fs = require('fs');
const path = require('path');

// 需要导入的数据映射
const DATA_MAPPINGS = [
  { file: 'cities.json', collection: 'cities' },
  { file: 'departments.json', collection: 'departments' },
  { file: 'models.json', collection: 'models' },
  { file: 'users.json', collection: 'uni-id-users' },
  { file: 'agents.json', collection: 'agents' },
  { file: 'web-cards.json', collection: 'web-cards' },
  { file: 'feishu-cards.json', collection: 'feishu-cards' }
];

const DATA_DIR = path.join(__dirname, '../data-export');

console.log('📦 准备导入数据到 uniCloud...\n');
console.log('⚠️  注意：此脚本需要在 HBuilderX 中使用云函数来执行实际导入');
console.log('==========================================\n');

// 检查数据文件
let allFilesExist = true;
for (const mapping of DATA_MAPPINGS) {
  const filePath = path.join(DATA_DIR, mapping.file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ ${mapping.file.padEnd(20)} -> ${mapping.collection.padEnd(20)} (${data.length} 条)`);
  } else {
    console.log(`❌ ${mapping.file.padEnd(20)} -> 文件不存在`);
    allFilesExist = false;
  }
}

console.log('\n==========================================');

if (!allFilesExist) {
  console.log('\n❌ 部分数据文件不存在，请先运行 npm run export');
  process.exit(1);
}

console.log('\n📝 下一步操作：');
console.log('');
console.log('1. 在 HBuilderX 中右键 data-import 云函数');
console.log('2. 选择"上传并运行"');
console.log('3. 依次导入以下数据（按顺序）：');
console.log('');

// 为每个表生成导入参数
for (let i = 0; i < DATA_MAPPINGS.length; i++) {
  const mapping = DATA_MAPPINGS[i];
  const filePath = path.join(DATA_DIR, mapping.file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log(`\n【${i + 1}/${DATA_MAPPINGS.length}】导入 ${mapping.collection}:`);
  console.log('```json');
  console.log(JSON.stringify({
    collection: mapping.collection,
    data: data,
    clearBefore: true
  }, null, 2).substring(0, 200) + '...');
  console.log('```');
  console.log(`数据条数: ${data.length}`);
}

console.log('\n\n💡 提示：由于数据量较大，建议使用下面的自动化方案\n');

// 生成分批导入脚本
console.log('=== 或者使用以下 Node.js 脚本自动化导入 ===\n');

const autoImportScript = `
// 自动化导入脚本
// 需要先配置 uniCloud SDK

const uniCloud = require('@dcloudio/uni-cloud');

uniCloud.init({
  spaceId: 'your-space-id',  // 替换为你的服务空间 ID
  clientSecret: 'your-client-secret'  // 替换为你的客户端密钥
});

async function importAll() {
  const mappings = ${JSON.stringify(DATA_MAPPINGS, null, 2)};
  
  for (const mapping of mappings) {
    const data = require('../data-export/' + mapping.file);
    
    console.log(\`导入 \${mapping.collection}...\`);
    
    const res = await uniCloud.callFunction({
      name: 'data-import',
      data: {
        collection: mapping.collection,
        data: data,
        clearBefore: true
      }
    });
    
    console.log(\`结果:\`, res);
  }
}

importAll().catch(console.error);
`;

// 保存自动化脚本
const autoScriptPath = path.join(__dirname, 'auto-import-unicloud.js');
fs.writeFileSync(autoScriptPath, autoImportScript, 'utf8');

console.log(`自动化脚本已生成: ${autoScriptPath}`);
console.log('配置好 spaceId 和 clientSecret 后可运行\n');
