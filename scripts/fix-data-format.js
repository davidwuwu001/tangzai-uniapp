/**
 * 修复数据格式以匹配 MongoDB Schema
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'migration-output', 'users-data.json');
const outputFile = path.join(__dirname, 'migration-output', 'users-data-fixed.json');

console.log('🔧 开始修复数据格式...\n');

// 读取原始数据
const usersData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
console.log(`📊 原始数据量: ${usersData.length} 条\n`);

// 修复数据
const fixedData = usersData.map((user, index) => {
  const fixed = { ...user };
  
  // 1. 修复 city: 字符串 → 数字
  if (fixed.city && typeof fixed.city === 'string') {
    fixed.city = parseInt(fixed.city, 10);
  }
  
  // 2. 修复日期格式: ISO字符串 → 时间戳
  if (fixed.register_date && typeof fixed.register_date === 'string') {
    fixed.register_date = new Date(fixed.register_date).getTime();
  }
  
  if (fixed.last_login_date && typeof fixed.last_login_date === 'string') {
    fixed.last_login_date = new Date(fixed.last_login_date).getTime();
  }
  
  // 3. 确保必填字段存在
  if (!fixed.username) {
    console.warn(`⚠️  记录 ${index + 1}: 缺少 username 字段`);
  }
  
  // 4. 移除空字符串（MongoDB 不喜欢空字符串）
  Object.keys(fixed).forEach(key => {
    if (fixed[key] === '') {
      delete fixed[key];
    }
  });
  
  // 5. 确保数组字段是数组
  if (fixed.role && !Array.isArray(fixed.role)) {
    fixed.role = [fixed.role];
  }
  if (fixed.permission && !Array.isArray(fixed.permission)) {
    fixed.permission = [fixed.permission];
  }
  if (fixed.token && !Array.isArray(fixed.token)) {
    fixed.token = [fixed.token];
  }
  
  return fixed;
});

// 统计修复信息
console.log('✅ 数据修复完成\n');
console.log('修复项目：');
console.log('  - city 字段: 字符串 → 数字');
console.log('  - register_date: ISO字符串 → 时间戳');
console.log('  - last_login_date: ISO字符串 → 时间戳');
console.log('  - 移除空字符串字段');
console.log('  - 确保数组字段格式正确\n');

// 保存修复后的数据
fs.writeFileSync(outputFile, JSON.stringify(fixedData, null, 2), 'utf-8');
console.log(`💾 已保存到: ${outputFile}`);
console.log(`📊 修复后数据量: ${fixedData.length} 条\n`);

// 显示修复前后对比
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('修复前示例：');
console.log(JSON.stringify(usersData[0], null, 2));
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('修复后示例：');
console.log(JSON.stringify(fixedData[0], null, 2));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✨ 请使用修复后的文件导入：');
console.log(outputFile);
