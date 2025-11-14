// 生成可直接在 HBuilderX 云函数测试中使用的导入参数
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data-export');
const OUTPUT_DIR = path.join(__dirname, '../import-params');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 小数据量的表（可以直接在 HBuilderX 中粘贴）
const SMALL_TABLES = [
  { file: 'cities.json', collection: 'cities' },
  { file: 'departments.json', collection: 'departments' },
  { file: 'models.json', collection: 'models' },
  { file: 'agents.json', collection: 'agents' }
];

// 大数据量的表（需要分批）
const LARGE_TABLES = [
  { file: 'users.json', collection: 'uni-id-users', batchSize: 50 },
  { file: 'web-cards.json', collection: 'web-cards', batchSize: 20 },
  { file: 'feishu-cards.json', collection: 'feishu-cards', batchSize: 10 }
];

console.log('生成导入参数文件...\n');

// 生成小表的完整参数
for (const table of SMALL_TABLES) {
  const filePath = path.join(DATA_DIR, table.file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const params = {
    collection: table.collection,
    data: data,
    clearBefore: true
  };
  
  const outputPath = path.join(OUTPUT_DIR, `${table.collection}-import.json`);
  fs.writeFileSync(outputPath, JSON.stringify(params, null, 2), 'utf8');
  
  console.log(`✅ ${table.collection.padEnd(20)} -> ${path.basename(outputPath)} (${data.length} 条)`);
}

// 生成大表的分批参数
for (const table of LARGE_TABLES) {
  const filePath = path.join(DATA_DIR, table.file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const batchSize = table.batchSize;
  const batchCount = Math.ceil(data.length / batchSize);
  
  for (let i = 0; i < batchCount; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const batchData = data.slice(start, end);
    
    const params = {
      collection: table.collection,
      data: batchData,
      clearBefore: i === 0  // 只在第一批清空
    };
    
    const outputPath = path.join(OUTPUT_DIR, `${table.collection}-batch${i + 1}-import.json`);
    fs.writeFileSync(outputPath, JSON.stringify(params, null, 2), 'utf8');
    
    if (i === 0) {
      console.log(`✅ ${table.collection.padEnd(20)} -> ${batchCount} 个批次文件 (每批 ${batchSize} 条)`);
    }
  }
}

console.log(`\n所有参数文件已生成到: ${OUTPUT_DIR}\n`);
console.log('📝 使用方法：');
console.log('1. 在 HBuilderX 中右键 data-import 云函数');
console.log('2. 选择"上传云函数"');
console.log('3. 点击"云端运行"');
console.log('4. 复制对应的 JSON 文件内容到参数框');
console.log('5. 点击"运行"');
console.log('\n按顺序导入：');
console.log('  1. cities');
console.log('  2. departments');
console.log('  3. models');
console.log('  4. uni-id-users (3个批次)');
console.log('  5. agents');
console.log('  6. web-cards (2个批次)');
console.log('  7. feishu-cards (2个批次)');
