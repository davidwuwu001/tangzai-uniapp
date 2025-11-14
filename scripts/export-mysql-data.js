// MySQL 数据导出和转换脚本
// 用途：从原 MySQL 数据库导出数据并转换为 MongoDB 格式

const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

// 从 vercel.json 读取数据库配置
let DB_CONFIG = null

try {
  const vercelPath = path.join(__dirname, '../../tangzai-zhushou-1105/vercel.json')
  if (fs.existsSync(vercelPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'))
    const dbUrl = vercelConfig.env?.DATABASE_URL
    
    if (dbUrl) {
      // 解析 DATABASE_URL: mysql://user:pass@host:port/database
      const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
      if (urlMatch) {
        DB_CONFIG = {
          host: urlMatch[3],
          port: parseInt(urlMatch[4]),
          user: urlMatch[1],
          password: urlMatch[2],
          database: urlMatch[5]
        }
        console.log('✅ 从 vercel.json 读取数据库配置成功')
      }
    }
  }
} catch (error) {
  console.log('⚠️  读取 vercel.json 失败，使用默认配置')
}

// 如果没有从 vercel.json 读取到，使用环境变量或默认值
if (!DB_CONFIG) {
  DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'xhs-haushu',
    password: process.env.DB_PASSWORD || '7788Gg7788',
    database: process.env.DB_NAME || 'xhs-haushu'
  }
}

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../data-export')

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

/**
 * 主函数
 */
async function main() {
  let connection

  try {
    console.log('🔗 连接 MySQL 数据库...')
    console.log(`   Host: ${DB_CONFIG.host}`)
    console.log(`   Database: ${DB_CONFIG.database}`)
    
    connection = await mysql.createConnection(DB_CONFIG)
    console.log('✅ 数据库连接成功\n')

    // 1. 导出用户数据
    await exportUsers(connection)

    // 2. 导出智能体数据
    await exportAgents(connection)

    // 3. 导出网页卡片数据
    await exportWebCards(connection)

    // 4. 导出飞书卡片数据
    await exportFeishuCards(connection)

    // 5. 导出城市数据（如果存在）
    await exportCities(connection)

    // 6. 导出部门数据（如果存在）
    await exportDepartments(connection)

    // 7. 导出 AI 模型数据
    await exportModels(connection)

    console.log('\n🎉 所有数据导出完成！')
    console.log(`📁 数据文件保存在: ${OUTPUT_DIR}`)

  } catch (error) {
    console.error('❌ 错误:', error.message)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 数据库连接已关闭')
    }
  }
}

/**
 * 导出用户数据
 */
async function exportUsers(connection) {
  console.log('📊 导出用户数据...')
  
  const [users] = await connection.execute('SELECT * FROM users')
  console.log(`   找到 ${users.length} 个用户`)

  // 转换为 MongoDB 格式
  const transformedUsers = users.map(u => ({
    _id: `user_${u.id}`,
    username: u.username,
    mobile: u.phone || u.mobile || '',
    mobile_confirmed: 1,
    email: u.email || '',
    password: u.password,  // 密码已加密
    city: u.city ? parseInt(u.city) : null,
    city_name: u.city_name || '',
    department: u.department || '伙伴',
    is_admin: u.is_admin === 1 || u.is_admin === true,
    avatar: u.avatar || '',
    role: u.is_admin ? ['admin'] : ['user'],
    permission: [],
    register_date: u.created_at ? new Date(u.created_at).getTime() : Date.now(),
    register_ip: '',
    last_login_date: u.updated_at ? new Date(u.updated_at).getTime() : null,
    last_login_ip: '',
    status: 0,  // 0-正常，1-禁用
    created_at: u.created_at ? new Date(u.created_at).getTime() : Date.now(),
    updated_at: u.updated_at ? new Date(u.updated_at).getTime() : Date.now()
  }))

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'users.json'),
    JSON.stringify(transformedUsers, null, 2),
    'utf8'
  )
  console.log('   ✅ users.json 已生成\n')
}

/**
 * 导出智能体数据
 */
async function exportAgents(connection) {
  console.log('📊 导出智能体数据...')
  
  const [agents] = await connection.execute('SELECT * FROM agents')
  console.log(`   找到 ${agents.length} 个智能体`)

  // 转换为 MongoDB 格式
  const transformedAgents = agents.map(a => {
    // 解析 JSON 字段
    let cities = ['all']
    let departments = ['all']
    let volc_config = null

    try {
      cities = a.cities ? JSON.parse(a.cities) : ['all']
    } catch (e) {
      cities = ['all']
    }

    try {
      departments = a.departments ? JSON.parse(a.departments) : ['all']
    } catch (e) {
      departments = ['all']
    }

    try {
      volc_config = a.volc_config ? JSON.parse(a.volc_config) : null
    } catch (e) {
      volc_config = null
    }

    return {
      _id: `agent_${a.id}`,
      name: a.name,
      description: a.description || '',
      system_prompt: a.system_prompt,
      max_tokens: a.max_tokens || 2000,
      temperature: a.temperature || 0.7,
      model_id: a.model_id ? `model_${a.model_id}` : null,
      navigation_tab: a.navigation_tab || '教研',
      cities: cities,
      departments: departments,
      agent_type: a.agent_type || 'openai',
      volc_service_id: a.volc_service_id || null,
      volc_config: volc_config,
      icon_name: a.icon_name || 'Bot',
      icon_type: a.icon_type || 'builtin',
      icon_color: a.icon_color || '#6366f1',
      is_active: a.is_active === 1 || a.is_active === true,
      created_at: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
      updated_at: a.updated_at ? new Date(a.updated_at).getTime() : Date.now()
    }
  })

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'agents.json'),
    JSON.stringify(transformedAgents, null, 2),
    'utf8'
  )
  console.log('   ✅ agents.json 已生成\n')
}

/**
 * 导出网页卡片数据
 */
async function exportWebCards(connection) {
  console.log('📊 导出网页卡片数据...')
  
  const [cards] = await connection.execute('SELECT * FROM web_cards')
  console.log(`   找到 ${cards.length} 个网页卡片`)

  // 转换为 MongoDB 格式
  const transformedCards = cards.map(c => {
    let cities = ['all']
    let departments = ['all']
    let display_fields = []

    try {
      cities = c.cities ? JSON.parse(c.cities) : ['all']
    } catch (e) {
      cities = ['all']
    }

    try {
      departments = c.departments ? JSON.parse(c.departments) : ['all']
    } catch (e) {
      departments = ['all']
    }

    try {
      display_fields = c.display_fields ? JSON.parse(c.display_fields) : []
    } catch (e) {
      display_fields = []
    }

    return {
      _id: `webcard_${c.id}`,
      title: c.title,
      description: c.description || '',
      url: c.url,
      navigation_tab: c.navigation_tab || '服务',
      cities: cities,
      departments: departments,
      icon_url: c.icon_url || null,
      icon_name: c.icon_name || 'Globe',
      icon_type: c.icon_type || 'builtin',
      icon_color: c.icon_color || '#6366f1',
      open_mode: c.open_mode || 'auto',
      display_fields: display_fields,
      is_active: c.is_active === 1 || c.is_active === true,
      created_at: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
      updated_at: c.updated_at ? new Date(c.updated_at).getTime() : Date.now()
    }
  })

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'web-cards.json'),
    JSON.stringify(transformedCards, null, 2),
    'utf8'
  )
  console.log('   ✅ web-cards.json 已生成\n')
}

/**
 * 导出飞书卡片数据
 */
async function exportFeishuCards(connection) {
  console.log('📊 导出飞书卡片数据...')
  
  const [cards] = await connection.execute('SELECT * FROM feishu_cards')
  console.log(`   找到 ${cards.length} 个飞书卡片`)

  // 转换为 MongoDB 格式
  const transformedCards = cards.map(c => {
    let cities = ['all']
    let departments = ['all']
    let display_fields = []
    let collapsed_fields = []
    let filter_config = null
    let query_conditions = []
    let field_config = null

    try {
      cities = c.cities ? JSON.parse(c.cities) : ['all']
    } catch (e) {
      cities = ['all']
    }

    try {
      departments = c.departments ? JSON.parse(c.departments) : ['all']
    } catch (e) {
      departments = ['all']
    }

    try {
      display_fields = c.display_fields ? JSON.parse(c.display_fields) : []
    } catch (e) {
      display_fields = []
    }

    try {
      collapsed_fields = c.collapsed_fields ? JSON.parse(c.collapsed_fields) : []
    } catch (e) {
      collapsed_fields = []
    }

    try {
      filter_config = c.filter_config ? JSON.parse(c.filter_config) : null
    } catch (e) {
      filter_config = null
    }

    try {
      query_conditions = c.query_conditions ? JSON.parse(c.query_conditions) : []
    } catch (e) {
      query_conditions = []
    }

    try {
      field_config = c.field_config ? JSON.parse(c.field_config) : null
    } catch (e) {
      field_config = null
    }

    return {
      _id: `feishucard_${c.id}`,
      title: c.title,
      description: c.description || '',
      app_id: c.app_id,
      app_secret: c.app_secret,
      table_url: c.table_url || '',
      table_id: c.table_id || '',
      app_token: c.app_token || '',
      navigation_tab: c.navigation_tab || '服务',
      card_type: c.card_type || 'feishu',
      cities: cities,
      departments: departments,
      icon_url: c.icon_url || null,
      icon_name: c.icon_name || 'Database',
      icon_type: c.icon_type || 'builtin',
      icon_color: c.icon_color || '#6366f1',
      display_fields: display_fields,
      collapsed_fields: collapsed_fields,
      filter_config: filter_config,
      query_conditions: query_conditions,
      enable_query_filter: c.enable_query_filter === 1 || c.enable_query_filter === true,
      field_config: field_config,
      is_active: c.is_active === 1 || c.is_active === true,
      created_at: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
      updated_at: c.updated_at ? new Date(c.updated_at).getTime() : Date.now()
    }
  })

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'feishu-cards.json'),
    JSON.stringify(transformedCards, null, 2),
    'utf8'
  )
  console.log('   ✅ feishu-cards.json 已生成\n')
}

/**
 * 导出城市数据
 */
async function exportCities(connection) {
  console.log('📊 导出城市数据...')
  
  try {
    const [cities] = await connection.execute('SELECT * FROM cities')
    console.log(`   找到 ${cities.length} 个城市`)

    const transformedCities = cities.map(c => ({
      _id: c.id,  // 城市ID保持数字
      name: c.name,
      code: c.code || '',
      is_active: c.is_active === 1 || c.is_active === true,
      created_at: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
      updated_at: c.updated_at ? new Date(c.updated_at).getTime() : Date.now()
    }))

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'cities.json'),
      JSON.stringify(transformedCities, null, 2),
      'utf8'
    )
    console.log('   ✅ cities.json 已生成\n')
  } catch (error) {
    console.log('   ⚠️  cities 表不存在或为空，跳过\n')
  }
}

/**
 * 导出部门数据
 */
async function exportDepartments(connection) {
  console.log('📊 导出部门数据...')
  
  try {
    const [depts] = await connection.execute('SELECT * FROM departments')
    console.log(`   找到 ${depts.length} 个部门`)

    const transformedDepts = depts.map(d => ({
      _id: `dept_${d.id}`,
      name: d.name,
      description: d.description || '',
      sort_order: d.sort_order || 0,
      is_active: d.is_active === 1 || d.is_active === true,
      created_at: d.created_at ? new Date(d.created_at).getTime() : Date.now(),
      updated_at: d.updated_at ? new Date(d.updated_at).getTime() : Date.now()
    }))

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'departments.json'),
      JSON.stringify(transformedDepts, null, 2),
      'utf8'
    )
    console.log('   ✅ departments.json 已生成\n')
  } catch (error) {
    console.log('   ⚠️  departments 表不存在或为空，跳过\n')
  }
}

/**
 * 导出 AI 模型数据
 */
async function exportModels(connection) {
  console.log('📊 导出 AI 模型数据...')
  
  try {
    const [models] = await connection.execute('SELECT * FROM models')
    console.log(`   找到 ${models.length} 个模型`)

    const transformedModels = models.map(m => ({
      _id: `model_${m.id}`,
      name: m.name,
      api_url: m.api_url,
      api_key: m.api_key,
      model_type: m.model_type || 'openai',
      is_active: m.is_active === 1 || m.is_active === true,
      created_at: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
      updated_at: m.updated_at ? new Date(m.updated_at).getTime() : Date.now()
    }))

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'models.json'),
      JSON.stringify(transformedModels, null, 2),
      'utf8'
    )
    console.log('   ✅ models.json 已生成\n')
  } catch (error) {
    console.log('   ⚠️  models 表不存在或为空，跳过\n')
  }
}

// 运行脚本
main().catch(console.error)
