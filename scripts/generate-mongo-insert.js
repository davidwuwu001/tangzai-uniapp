/**
 * 生成MongoDB插入语句
 * 最简单的方式：生成可以在MongoDB Shell中直接执行的命令
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'migration-output', 'users-data.json');
const outputFile = path.join(__dirname, 'migration-output', 'mongo-insert.js');

console.log('🔧 生成MongoDB插入语句...\n');

const usersData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// 生成MongoDB插入命令
let mongoScript = `// MongoDB 插入脚本
// 在 uniCloud 控制台的 MongoDB Shell 中执行

// 切换到正确的集合
use your_database_name;

// 批量插入用户数据
db.getCollection("uni-id-users").insertMany([
`;

// 添加每条数据
usersData.forEach((user, index) => {
  const mongoDoc = {
    username: user.username,
    mobile: user.mobile || undefined,
    nickname: user.nickname || user.username,
    password: user.password
  };
  
  // 移除 undefined
  Object.keys(mongoDoc).forEach(key => {
    if (mongoDoc[key] === undefined) delete mongoDoc[key];
  });
  
  mongoScript += '  ' + JSON.stringify(mongoDoc);
  
  if (index < usersData.length - 1) {
    mongoScript += ',\n';
  } else {
    mongoScript += '\n';
  }
});

mongoScript += `]);

print("导入完成：" + ${usersData.length} + " 条记录");
`;

fs.writeFileSync(outputFile, mongoScript, 'utf-8');

console.log(`✅ 生成完成: ${usersData.length} 条`);
console.log(`📁 文件: ${outputFile}\n`);

// 同时生成分批次的小文件（每批20条）
const batchSize = 20;
const batchDir = path.join(__dirname, 'migration-output', 'mongo-batches');

if (!fs.existsSync(batchDir)) {
  fs.mkdirSync(batchDir, { recursive: true });
}

for (let i = 0; i < usersData.length; i += batchSize) {
  const batch = usersData.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;
  
  let batchScript = `// 批次 ${batchNum} (${batch.length} 条)\ndb.getCollection("uni-id-users").insertMany([\n`;
  
  batch.forEach((user, idx) => {
    const mongoDoc = {
      username: user.username,
      mobile: user.mobile || undefined,
      nickname: user.nickname || user.username,
      password: user.password
    };
    
    Object.keys(mongoDoc).forEach(key => {
      if (mongoDoc[key] === undefined) delete mongoDoc[key];
    });
    
    batchScript += '  ' + JSON.stringify(mongoDoc);
    if (idx < batch.length - 1) {
      batchScript += ',\n';
    } else {
      batchScript += '\n';
    }
  });
  
  batchScript += ']);\n';
  
  const batchFile = path.join(batchDir, `batch-${batchNum}.js`);
  fs.writeFileSync(batchFile, batchScript, 'utf-8');
  
  console.log(`✅ 批次 ${batchNum}: ${batch.length} 条 → batch-${batchNum}.js`);
}

console.log(`\n✨ 生成完成！\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('使用方法：');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('方式1（推荐）：分批执行');
console.log(`1. 打开 ${batchDir}`);
console.log('2. 在 uniCloud 控制台 → 云数据库 → 右上角菜单');
console.log('3. 找到"数据库管理"或"运行命令"');
console.log('4. 逐个复制 batch-X.js 的内容执行\n');
console.log('方式2：一次性导入');
console.log(`1. 打开 ${outputFile}`);
console.log('2. 复制全部内容');
console.log('3. 在 MongoDB Shell 中执行');
