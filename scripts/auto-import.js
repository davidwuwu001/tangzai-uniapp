// 自动化数据导入脚本
// 通过 HTTP 请求自动导入所有数据

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ⚠️ 重要：上传 data-import-http 云函数后，从 HBuilderX 获取 URL
// 路径：右键 data-import-http → 查看详情 → 复制 "云函数URL化" 的地址
const CLOUD_FUNCTION_URL = 'YOUR_CLOUD_FUNCTION_URL_HERE';  // 需要替换

const IMPORT_TOKEN = 'tangzai-import-2025';  // 访问令牌

// 导入顺序
const IMPORT_ORDER = [
  { file: 'cities.json', collection: 'cities', clearBefore: true },
  { file: 'departments.json', collection: 'departments', clearBefore: true },
  { file: 'models.json', collection: 'models', clearBefore: true },
  { file: 'users.json', collection: 'uni-id-users', clearBefore: true, batchSize: 50 },
  { file: 'agents.json', collection: 'agents', clearBefore: true },
  { file: 'web-cards.json', collection: 'web-cards', clearBefore: true, batchSize: 20 },
  { file: 'feishu-cards.json', collection: 'feishu-cards', clearBefore: true, batchSize: 10 }
];

const DATA_DIR = path.join(__dirname, '../data-export');

/**
 * 发送 HTTP POST 请求
 */
function postData(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = client.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(new Error('响应解析失败: ' + body));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * 导入单个文件
 */
async function importFile(config) {
  const { file, collection, clearBefore, batchSize } = config;
  const filePath = path.join(DATA_DIR, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${file}`);
    return false;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log(`\n📦 导入 ${collection} (${data.length} 条数据)...`);
  
  // 如果需要分批
  if (batchSize && data.length > batchSize) {
    const batchCount = Math.ceil(data.length / batchSize);
    console.log(`   分为 ${batchCount} 个批次导入`);
    
    for (let i = 0; i < batchCount; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batchData = data.slice(start, end);
      
      console.log(`   批次 ${i + 1}/${batchCount}: ${batchData.length} 条...`);
      
      try {
        const result = await postData(CLOUD_FUNCTION_URL, {
          collection: collection,
          data: batchData,
          clearBefore: i === 0 ? clearBefore : false,  // 只在第一批清空
          token: IMPORT_TOKEN
        });
        
        if (result.code === 0) {
          console.log(`   ✅ 成功: ${result.inserted} 条`);
        } else {
          console.log(`   ❌ 失败: ${result.message}`);
          return false;
        }
      } catch (error) {
        console.log(`   ❌ 请求失败: ${error.message}`);
        return false;
      }
    }
  } else {
    // 一次性导入
    try {
      const result = await postData(CLOUD_FUNCTION_URL, {
        collection: collection,
        data: data,
        clearBefore: clearBefore,
        token: IMPORT_TOKEN
      });
      
      if (result.code === 0) {
        console.log(`   ✅ 成功: ${result.inserted} 条`);
      } else {
        console.log(`   ❌ 失败: ${result.message}`);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始自动化数据导入...\n');
  
  // 检查 URL 是否已配置
  if (CLOUD_FUNCTION_URL === 'YOUR_CLOUD_FUNCTION_URL_HERE') {
    console.log('❌ 错误：请先配置 CLOUD_FUNCTION_URL');
    console.log('\n📝 配置步骤：');
    console.log('1. 在 HBuilderX 中右键 data-import-http 云函数');
    console.log('2. 选择"上传云函数"');
    console.log('3. 上传成功后，右键 → "查看详情"');
    console.log('4. 找到"云函数URL化"部分，复制 URL');
    console.log('5. 将 URL 粘贴到本文件第 10 行的 CLOUD_FUNCTION_URL');
    console.log('6. 保存文件后重新运行 npm run auto-import\n');
    return;
  }
  
  console.log(`📡 云函数地址: ${CLOUD_FUNCTION_URL}\n`);
  console.log('==========================================\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const config of IMPORT_ORDER) {
    const success = await importFile(config);
    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log(`\n⚠️  ${config.collection} 导入失败，是否继续？`);
      console.log('   按 Ctrl+C 终止，或等待 5 秒自动继续...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n==========================================');
  console.log(`\n🎉 导入完成！`);
  console.log(`   成功: ${successCount} 个表`);
  console.log(`   失败: ${failCount} 个表`);
  console.log(`   总计: ${IMPORT_ORDER.length} 个表\n`);
}

// 运行
main().catch(console.error);
