/**
 * MySQL 用户数据迁移到 MongoDB 脚本
 * 
 * 功能：
 * 1. 从远程 MySQL 数据库导出用户数据
 * 2. 转换数据格式以适配 MongoDB Schema
 * 3. 批量导入到 uniCloud MongoDB
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 从 vercel.json 读取 MySQL 连接配置
function getMySQLConfig() {
  try {
    const vercelPath = path.join(__dirname, '../vercel.json');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
    const databaseUrl = vercelConfig.env.DATABASE_URL;
    
    // 解析连接字符串: mysql://user:pass@host:port/database
    const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = databaseUrl.match(regex);
    
    if (!match) {
      throw new Error('无法解析 DATABASE_URL');
    }
    
    return {
      host: match[3],
      port: parseInt(match[4]),
      user: match[1],
      password: match[2],
      database: match[5]
    };
  } catch (error) {
    console.error('读取配置失败，使用默认配置:', error.message);
    // 默认配置
    return {
      host: 'localhost',
      port: 3306,
      user: 'xhs-haushu',
      password: '7788Gg7788',
      database: 'xhs-haushu'
    };
  }
}

const MYSQL_CONFIG = getMySQLConfig();
console.log('MySQL配置:', {
  host: MYSQL_CONFIG.host,
  port: MYSQL_CONFIG.port,
  user: MYSQL_CONFIG.user,
  database: MYSQL_CONFIG.database
});

// 输出文件路径
const OUTPUT_DIR = path.join(__dirname, 'migration-output');
const USERS_JSON = path.join(OUTPUT_DIR, 'users-data.json');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 从 MySQL 导出用户数据
 */
async function exportUsersFromMySQL() {
  console.log('🔗 连接到 MySQL 数据库...');
  
  let connection;
  try {
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ MySQL 连接成功');

    // 查询所有用户数据
    console.log('📥 正在导出用户数据...');
    const [rows] = await connection.execute('SELECT * FROM users');
    
    console.log(`✅ 导出 ${rows.length} 条用户数据`);
    
    return rows;
  } catch (error) {
    console.error('❌ MySQL 导出失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL 连接已关闭');
    }
  }
}

/**
 * 转换数据格式：MySQL → MongoDB
 */
function transformUserData(mysqlUsers) {
  console.log('🔄 转换数据格式...');
  
  const mongoUsers = mysqlUsers.map(user => {
    // 基础字段映射 - 保留所有MySQL字段
    const mongoUser = {
      username: user.username || user.name,
      mobile: user.mobile || user.phone,
      email: user.email || '', // 新增
      mobile_confirmed: user.mobile_confirmed || 0,
      password: user.password,
      nickname: user.nickname || user.username,
      avatar: user.avatar || user.avatar_url || '', // 新增 avatar_url
      avatar_color: user.avatar_color || '', // 新增
      city: user.city_id || user.city || null,
      city_name: user.city_name || '',
      department: user.department || '伙伴',
      is_admin: user.is_admin || false,
      role: user.role ? (Array.isArray(user.role) ? user.role : [user.role]) : ['user'],
      permission: user.permission || [],
      monthly_targets: user.monthly_targets || null, // 新增
      register_date: user.created_at || user.register_date || Date.now(),
      register_ip: user.register_ip || '',
      last_login_date: user.last_login_date || user.updated_at || null,
      last_login_ip: user.last_login_ip || '',
      token: user.token ? (Array.isArray(user.token) ? user.token : [user.token]) : [],
      token_expired: user.token_expired || null
    };

    // 移除 null 或 undefined 或空字符串的字段
    Object.keys(mongoUser).forEach(key => {
      if (mongoUser[key] === null || mongoUser[key] === undefined || mongoUser[key] === '') {
        delete mongoUser[key];
      }
    });

    return mongoUser;
  });

  console.log(`✅ 转换完成 ${mongoUsers.length} 条数据`);
  return mongoUsers;
}

/**
 * 保存数据到 JSON 文件
 */
function saveToJSON(data) {
  console.log(`💾 保存数据到 ${USERS_JSON}`);
  
  fs.writeFileSync(USERS_JSON, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log('✅ 数据已保存到 JSON 文件');
  console.log(`📁 文件路径: ${USERS_JSON}`);
}

/**
 * 生成导入说明
 */
function generateImportInstructions() {
  const instructions = `
==============================================
  MongoDB 数据导入说明
==============================================

数据文件: ${USERS_JSON}

方式一：通过 uniCloud Web 控制台导入
1. 登录 uniCloud 控制台: https://unicloud.dcloud.net.cn
2. 选择您的服务空间
3. 进入「云数据库」→「uni-id-users」表
4. 点击「导入」按钮
5. 上传 users-data.json 文件
6. 选择「插入新记录」模式
7. 点击「开始导入」

方式二：通过云函数导入
1. 使用以下云函数代码批量导入：

// uniCloud-aliyun/cloudfunctions/import-users/index.js
const db = uniCloud.database();
const usersData = require('./users-data.json');

exports.main = async (event, context) => {
  const dbCmd = db.command;
  const collection = db.collection('uni-id-users');
  
  // 分批导入，每批50条
  const batchSize = 50;
  const batches = [];
  
  for (let i = 0; i < usersData.length; i += batchSize) {
    batches.push(usersData.slice(i, i + batchSize));
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const batch of batches) {
    try {
      const res = await collection.add(batch);
      successCount += res.inserted || batch.length;
    } catch (e) {
      console.error('批次导入失败:', e);
      errorCount += batch.length;
    }
  }
  
  return {
    success: true,
    message: \`导入完成：成功 \${successCount} 条，失败 \${errorCount} 条\`,
    total: usersData.length,
    successCount,
    errorCount
  };
};

2. 将 users-data.json 复制到云函数目录
3. 上传并运行云函数

==============================================
`;

  const instructionsFile = path.join(OUTPUT_DIR, 'IMPORT_INSTRUCTIONS.txt');
  fs.writeFileSync(instructionsFile, instructions, 'utf-8');
  
  console.log(instructions);
  console.log(`📋 导入说明已保存到: ${instructionsFile}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始 MySQL → MongoDB 数据迁移\n');
  
  try {
    // 步骤 1: 从 MySQL 导出数据
    const mysqlUsers = await exportUsersFromMySQL();
    
    if (!mysqlUsers || mysqlUsers.length === 0) {
      console.log('⚠️  未找到用户数据');
      return;
    }
    
    // 步骤 2: 转换数据格式
    const mongoUsers = transformUserData(mysqlUsers);
    
    // 步骤 3: 保存到 JSON 文件
    saveToJSON(mongoUsers);
    
    // 步骤 4: 生成导入说明
    generateImportInstructions();
    
    console.log('\n✨ 迁移准备完成！');
    console.log('📦 请查看 migration-output 目录');
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    process.exit(1);
  }
}

// 执行
main();
