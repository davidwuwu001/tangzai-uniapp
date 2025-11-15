/**
 * 生成最简化的数据格式，只保留必填字段
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'migration-output', 'users-data.json');
const outputFile = path.join(__dirname, 'migration-output', 'users-data-simple.json');

console.log('🔧 生成简化数据...\n');

// 读取原始数据
const usersData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// 只保留最基本的字段
const simplifiedData = usersData.map(user => {
  const simple = {
    username: user.username || user.nickname || 'unknown'
  };
  
  // 可选字段，有值才添加
  if (user.mobile) simple.mobile = user.mobile;
  if (user.nickname) simple.nickname = user.nickname;
  if (user.password) simple.password = user.password;
  
  return simple;
});

// 保存
fs.writeFileSync(outputFile, JSON.stringify(simplifiedData, null, 2), 'utf-8');

console.log(`✅ 生成完成: ${simplifiedData.length} 条`);
console.log(`📁 文件: ${outputFile}\n`);

console.log('示例数据：');
console.log(JSON.stringify(simplifiedData.slice(0, 3), null, 2));
