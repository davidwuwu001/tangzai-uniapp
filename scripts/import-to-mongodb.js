/**
 * 直接通过云函数导入数据到MongoDB
 * 使用uniCloud云函数URL化功能
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 读取导出的用户数据
const usersDataPath = path.join(__dirname, 'migration-output', 'users-data.json');
const usersData = JSON.parse(fs.readFileSync(usersDataPath, 'utf-8'));

console.log('📦 准备导入数据...');
console.log(`📊 数据量: ${usersData.length} 条用户记录\n`);

// uniCloud云函数调用配置
// 需要从 HBuilderX 获取云函数的HTTP URL
const CLOUD_FUNCTION_CONFIG = {
  // 方法1：使用云函数URL化（需要在uniCloud控制台配置）
  url: null,
  
  // 方法2：使用 uniCloud clientDB（需要appId和spaceId）
  spaceId: null,
  clientSecret: null
};

// 由于无法直接从命令行调用云函数，这里提供替代方案
console.log('⚠️  无法从命令行直接调用云函数\n');
console.log('请选择以下方式之一：\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('方式一：通过 uniCloud Web 控制台导入（最简单）');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. 访问：https://unicloud.dcloud.net.cn');
console.log('2. 登录并选择服务空间');
console.log('3. 点击「云数据库」→ 选择「uni-id-users」表');
console.log('4. 点击「导入」按钮');
console.log('5. 上传文件：');
console.log(`   ${usersDataPath}`);
console.log('6. 选择「插入新记录」模式');
console.log('7. 点击「开始导入」\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('方式二：通过云函数测试界面');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. 访问：https://unicloud.dcloud.net.cn');
console.log('2. 进入「云函数/云对象」→「import-users」');
console.log('3. 点击「云端运行」标签');
console.log('4. 选择方法：importWithDedupe');
console.log('5. 输入参数（复制下面的JSON）：\n');

// 生成可以直接复制的JSON参数
const jsonParam = {
  users: usersData.slice(0, 10) // 只显示前10条作为示例
};

console.log('━━━━ 参数示例（前10条）━━━━');
console.log(JSON.stringify(jsonParam, null, 2));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⚠️  注意：完整数据请从 users-data.json 复制\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('方式三：生成分批导入脚本');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 生成分批文件
const batchSize = 50;
const batchDir = path.join(__dirname, 'migration-output', 'batches');

if (!fs.existsSync(batchDir)) {
  fs.mkdirSync(batchDir, { recursive: true });
}

for (let i = 0; i < usersData.length; i += batchSize) {
  const batch = usersData.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;
  const batchFile = path.join(batchDir, `batch-${batchNum}.json`);
  
  fs.writeFileSync(batchFile, JSON.stringify({ users: batch }, null, 2), 'utf-8');
  console.log(`✅ 生成批次 ${batchNum}: ${batch.length} 条记录 → ${path.basename(batchFile)}`);
}

const totalBatches = Math.ceil(usersData.length / batchSize);
console.log(`\n✅ 共生成 ${totalBatches} 个批次文件`);
console.log(`📁 位置: ${batchDir}\n`);

console.log('使用方法：');
console.log('1. 在云函数测试界面，逐个上传批次文件内容');
console.log('2. 每次调用 importWithDedupe 方法');
console.log('3. 粘贴对应批次的JSON内容\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('方式四：使用 HBuilderX 调试');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. 在 HBuilderX 中打开项目');
console.log('2. 运行 → 运行到浏览器 → Chrome');
console.log('3. 在浏览器控制台执行：\n');

console.log('```javascript');
console.log('// 在浏览器控制台执行');
console.log('(async () => {');
console.log('  const usersData = ' + JSON.stringify(usersData.slice(0, 2)) + ';');
console.log('  const importUsersObj = uniCloud.importObject("import-users");');
console.log('  const result = await importUsersObj.importWithDedupe(usersData);');
console.log('  console.log(result);');
console.log('})();');
console.log('```\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('💡 推荐方式一（Web控制台），最简单快捷！');
console.log('\n🎯 数据文件位置：');
console.log(usersDataPath);
