// 超简单的导入脚本
// 用途：直接输出可以在 HBuilderX 中粘贴的参数

const fs = require('fs');
const path = require('path');

// 导入顺序
const IMPORT_ORDER = [
  { file: 'cities.json', collection: 'cities', name: '城市' },
  { file: 'departments.json', collection: 'departments', name: '部门' },
  { file: 'models.json', collection: 'models', name: 'AI模型' },
  { file: 'agents.json', collection: 'agents', name: '智能体' },
  { file: 'web-cards.json', collection: 'web-cards', name: '网页卡片' },
  { file: 'feishu-cards.json', collection: 'feishu-cards', name: '飞书卡片' }
];

const DATA_DIR = path.join(__dirname, '../data-export');
const OUTPUT_DIR = path.join(__dirname, '../simple-import-params');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🚀 生成简化的导入参数...\n');

// users 需要分批
const usersFile = path.join(DATA_DIR, 'users.json');
if (fs.existsSync(usersFile)) {
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const batchSize = 50;
  const batchCount = Math.ceil(users.length / batchSize);
  
  for (let i = 0; i < batchCount; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, users.length);
    const batchData = users.slice(start, end);
    
    const params = {
      collection: 'uni-id-users',
      data: batchData,
      clearBefore: i === 0
    };
    
    const outputPath = path.join(OUTPUT_DIR, `${i + 1}-users-batch${i + 1}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(params, null, 2), 'utf8');
    
    console.log(`✅ 已生成: ${i + 1}-users-batch${i + 1}.json (${batchData.length} 条)`);
  }
}

// 其他表
let index = 4;  // 从4开始，因为users已经占了1-3
for (const config of IMPORT_ORDER) {
  const filePath = path.join(DATA_DIR, config.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  跳过: ${config.name} - 文件不存在`);
    continue;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const params = {
    collection: config.collection,
    data: data,
    clearBefore: true
  };
  
  const outputPath = path.join(OUTPUT_DIR, `${index}-${config.collection}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(params, null, 2), 'utf8');
  
  console.log(`✅ 已生成: ${index}-${config.collection}.json (${data.length} 条)`);
  index++;
}

console.log('\n==========================================');
console.log(`\n📁 参数文件已生成到: ${OUTPUT_DIR}`);
console.log('\n📝 导入步骤（在 HBuilderX 中）：');
console.log('\n按照文件名的数字顺序，依次执行以下操作：');
console.log('1. 右键 data-import 云函数 → 云端运行');
console.log('2. 打开对应的参数文件（用记事本）');
console.log('3. Ctrl+A 全选 → Ctrl+C 复制');
console.log('4. 粘贴到 HBuilderX 的参数框');
console.log('5. 点击"运行"');
console.log('6. 等待成功后，继续下一个文件');
console.log('\n导入顺序：');

// 重新扫描输出目录显示顺序
const files = fs.readdirSync(OUTPUT_DIR).sort();
files.forEach((file, i) => {
  console.log(`  ${i + 1}. ${file}`);
});

console.log('\n💡 提示：每次复制粘贴只需要10秒，总共9个文件，大约2分钟完成！\n');
