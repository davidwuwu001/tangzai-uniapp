/**
 * 检查MySQL原始数据的所有字段
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 从vercel.json读取配置
function getMySQLConfig() {
  const vercelPath = path.join(__dirname, '../vercel.json');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
  const databaseUrl = vercelConfig.env.DATABASE_URL;
  
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = databaseUrl.match(regex);
  
  return {
    host: match[3],
    port: parseInt(match[4]),
    user: match[1],
    password: match[2],
    database: match[5]
  };
}

async function checkFields() {
  console.log('🔍 检查MySQL数据字段...\n');
  
  const config = getMySQLConfig();
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ 连接成功\n');
    
    // 获取表结构
    const [columns] = await connection.execute(
      'SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?',
      ['users', config.database]
    );
    
    console.log('📋 users 表字段列表:');
    console.log('═'.repeat(50));
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME.padEnd(30)} (${col.DATA_TYPE})`);
    });
    console.log('═'.repeat(50));
    console.log(`\n总共 ${columns.length} 个字段\n`);
    
    // 获取第一条数据
    const [rows] = await connection.execute('SELECT * FROM users LIMIT 1');
    
    if (rows.length > 0) {
      console.log('📝 第一条数据示例:');
      console.log('═'.repeat(50));
      const user = rows[0];
      Object.keys(user).forEach(key => {
        const value = user[key];
        let displayValue = value;
        
        if (value === null) {
          displayValue = 'NULL';
        } else if (typeof value === 'string' && value.length > 50) {
          displayValue = value.substring(0, 47) + '...';
        } else if (value instanceof Date) {
          displayValue = value.toISOString();
        }
        
        console.log(`  ${key.padEnd(30)}: ${displayValue}`);
      });
      console.log('═'.repeat(50));
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkFields();
