/**
 * 生成小批量数据，方便在uniCloud控制台手动添加
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'migration-output', 'users-data-final.json');
const outputDir = path.join(__dirname, 'migration-output', 'small-batches');

const usersData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🔧 生成小批量数据文件...\n');

// 每批10条
const batchSize = 10;
const totalBatches = Math.ceil(usersData.length / batchSize);

for (let i = 0; i < usersData.length; i += batchSize) {
  const batch = usersData.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;
  
  // 生成单条JSON格式（便于在控制台添加单条）
  const singleFile = path.join(outputDir, `batch-${batchNum}-单条格式.txt`);
  let singleContent = `批次 ${batchNum} - 共 ${batch.length} 条记录\n`;
  singleContent += `请在 uniCloud 控制台 → 云数据库 → uni-id-users → 点击"添加记录"\n`;
  singleContent += `每次复制一条JSON，粘贴到表单，点击保存\n\n`;
  singleContent += '═'.repeat(60) + '\n\n';
  
  batch.forEach((user, idx) => {
    singleContent += `--- 第 ${i + idx + 1} 条 (${user.username}) ---\n`;
    singleContent += JSON.stringify(user, null, 2);
    singleContent += '\n\n';
  });
  
  fs.writeFileSync(singleFile, singleContent, 'utf-8');
  
  // 生成数组格式（如果支持批量）
  const arrayFile = path.join(outputDir, `batch-${batchNum}-数组格式.json`);
  fs.writeFileSync(arrayFile, JSON.stringify(batch, null, 2), 'utf-8');
  
  console.log(`✅ 批次 ${batchNum}: ${batch.length} 条`);
}

console.log(`\n✨ 生成完成！共 ${totalBatches} 个批次\n`);
console.log('📁 文件位置:', outputDir);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('使用方法：');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1. 打开 uniCloud 控制台');
console.log('2. 云数据库 → uni-id-users 表');
console.log('3. 点击"添加记录"按钮');
console.log('4. 切换到"JSON编辑"模式');
console.log('5. 复制 batch-X-单条格式.txt 中的单条JSON');
console.log('6. 粘贴并保存');
console.log('7. 重复步骤3-6，完成所有记录\n');
console.log('💡 提示：先测试batch-1，成功后再继续其他批次');
