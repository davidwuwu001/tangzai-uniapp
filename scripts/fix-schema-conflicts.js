/**
 * 修复所有Schema冲突
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'migration-output', 'users-data.json');
const outputFile = path.join(__dirname, 'migration-output', 'users-data-final.json');

console.log('🔧 修复Schema冲突...\n');

const usersData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// Schema允许的部门枚举值
const allowedDepartments = ["经理", "顾客部", "开拓部", "教研部", "商务部", "财务部", "法务部", "伙伴"];

// 部门映射
const departmentMapping = {
  "AI效率部": "教研部",  // 映射到最接近的部门
  "顾客部": "顾客部",
  "教研部": "教研部",
  "伙伴": "伙伴",
  "财务部": "财务部"
};

const fixedData = usersData.map((user, index) => {
  const fixed = {};
  
  // 1. 必填字段
  fixed.username = user.username;
  
  // 2. 可选字段（有值才添加）
  if (user.mobile) fixed.mobile = user.mobile;
  if (user.email) fixed.email = user.email;
  if (user.nickname) fixed.nickname = user.nickname;
  if (user.avatar) fixed.avatar = user.avatar;
  if (user.avatar_color) fixed.avatar_color = user.avatar_color;
  
  // 3. 修复department - 必须在枚举值内
  if (user.department) {
    const mappedDept = departmentMapping[user.department];
    if (mappedDept && allowedDepartments.includes(mappedDept)) {
      fixed.department = mappedDept;
    } else {
      fixed.department = "伙伴"; // 默认值
      console.log(`⚠️  记录 ${index + 1} (${user.username}): 部门 "${user.department}" 映射为 "伙伴"`);
    }
  }
  
  // 4. password - 作为普通字符串处理
  if (user.password) {
    fixed.password = user.password;
  }
  
  // 5. 移除 register_date 和 last_login_date
  // 因为 Schema 设置了 forceDefaultValue，会自动使用当前时间
  // 如果导入时包含这些字段可能导致冲突
  
  // 6. 其他简单字段
  if (user.mobile_confirmed !== undefined) {
    fixed.mobile_confirmed = user.mobile_confirmed;
  }
  if (user.is_admin !== undefined) {
    fixed.is_admin = user.is_admin;
  }
  
  // 7. 数组字段
  if (user.role && Array.isArray(user.role)) {
    fixed.role = user.role;
  }
  if (user.permission && Array.isArray(user.permission)) {
    fixed.permission = user.permission;
  }
  if (user.token && Array.isArray(user.token)) {
    fixed.token = user.token;
  }
  
  // 8. city转为数字
  if (user.city) {
    fixed.city = typeof user.city === 'string' ? parseInt(user.city, 10) : user.city;
  }
  if (user.city_name) {
    fixed.city_name = user.city_name;
  }
  
  return fixed;
});

fs.writeFileSync(outputFile, JSON.stringify(fixedData, null, 2), 'utf-8');

console.log('\n✅ 修复完成\n');
console.log('修复项目：');
console.log('  1. ✅ department字段 - 映射到允许的枚举值');
console.log('  2. ✅ 移除register_date（会自动生成）');
console.log('  3. ✅ 移除last_login_date');
console.log('  4. ✅ city转为数字类型');
console.log('  5. ✅ 保留password原始加密字符串\n');

console.log(`📊 数据量: ${fixedData.length} 条`);
console.log(`📁 输出: ${outputFile}\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('示例数据（修复后）：');
console.log(JSON.stringify(fixedData[0], null, 2));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✨ 请使用此文件重新导入！');
