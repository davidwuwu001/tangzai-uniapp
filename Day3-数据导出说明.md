# Day 3: 数据导出与转换

## 📋 任务概览

从原 MySQL 数据库导出所有数据，并转换为 MongoDB 格式，准备导入到 uniCloud。

---

## 🚀 执行步骤

### Step 1: 安装依赖

```bash
cd tangzai-uniapp/scripts
npm install
```

### Step 2: 配置数据库连接

编辑 `scripts/export-mysql-data.js` 文件第 10 行，替换数据库地址：

```javascript
host: process.env.DB_HOST || '**************',  // 替换为实际数据库地址
```

**方式 1: 直接修改代码**
```javascript
host: '你的数据库地址',
```

**方式 2: 使用环境变量（推荐）**
```bash
# Windows PowerShell
$env:DB_HOST="你的数据库地址"
$env:DB_PORT="3306"
$env:DB_USER="xhs-haushu"
$env:DB_PASSWORD="7788Gg7788"
$env:DB_NAME="xhs-haushu"

# 然后运行导出脚本
npm run export
```

### Step 3: 运行导出脚本

```bash
npm run export
```

---

## 📊 导出的数据表

脚本会导出以下数据并保存为 JSON 文件：

| 序号 | 表名 | 输出文件 | 说明 |
|------|------|---------|------|
| 1 | users | `users.json` | 用户数据 |
| 2 | agents | `agents.json` | 智能体数据 |
| 3 | web_cards | `web-cards.json` | 网页卡片数据 |
| 4 | feishu_cards | `feishu-cards.json` | 飞书卡片数据 |
| 5 | cities | `cities.json` | 城市数据 |
| 6 | departments | `departments.json` | 部门数据 |
| 7 | models | `models.json` | AI 模型数据 |

---

## 📂 输出目录

所有 JSON 文件将保存在：
```
tangzai-uniapp/data-export/
├── users.json
├── agents.json
├── web-cards.json
├── feishu-cards.json
├── cities.json
├── departments.json
└── models.json
```

---

## 🔄 数据转换说明

### 主要转换逻辑：

1. **ID 转换**
   - MySQL 数字 ID → MongoDB 字符串 ID
   - 格式：`{type}_{id}` 例如 `user_1`, `agent_5`

2. **时间戳转换**
   - MySQL TIMESTAMP → Unix 时间戳（毫秒）
   - `created_at`, `updated_at` 统一转换

3. **JSON 字段解析**
   - MySQL JSON 字段 → JavaScript 对象/数组
   - 包括：`cities`, `departments`, `filter_config` 等

4. **布尔值转换**
   - MySQL TINYINT(1) → JavaScript Boolean
   - `is_active`, `is_admin` 等字段

5. **字段映射**
   - `phone` → `mobile`
   - 添加 uni-id 标准字段（`role`, `permission` 等）

---

## ✅ 验证导出

运行成功后，检查 `data-export` 目录：

```bash
# 查看导出的文件
dir data-export

# 查看某个文件内容（PowerShell）
Get-Content data-export\users.json | ConvertFrom-Json | Format-Table
```

---

## ⚠️ 注意事项

1. **数据库连接**
   - 确保数据库地址正确
   - 确保网络可以访问数据库
   - 如果是远程数据库，检查防火墙设置

2. **数据安全**
   - 导出的 JSON 文件包含敏感信息（密码、API Key）
   - 不要提交到 Git
   - `data-export/` 目录已加入 `.gitignore`

3. **数据完整性**
   - 检查每个 JSON 文件的记录数
   - 与 MySQL 原表对比确认

---

## 🐛 常见问题

### 问题 1: 连接超时
```
Error: connect ETIMEDOUT
```
**解决**：检查数据库地址和网络连接

### 问题 2: 认证失败
```
Error: Access denied for user
```
**解决**：检查用户名和密码是否正确

### 问题 3: 表不存在
```
ER_NO_SUCH_TABLE: Table doesn't exist
```
**解决**：正常情况，脚本会跳过不存在的表

---

## 📝 下一步 (Day 4)

数据导出完成后，进入 **Day 4: 数据导入到 uniCloud**
- 创建数据导入云函数
- 批量导入 JSON 数据
- 验证数据完整性

---

**准备好运行导出脚本了吗？** 🎯
