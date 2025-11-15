# 汤仔助手 (TangZai UniApp)

一个基于 uniapp + uniCloud (MongoDB) 架构的多端应用,提供教研、服务和个人管理功能。

## 📋 项目信息

- **项目名称**: tangzai-uniapp
- **版本**: 1.0.0
- **框架**: uni-app (Vue 3)
- **云服务**: uniCloud (阿里云)
- **数据库**: MongoDB

## ✨ 功能特性

### 核心模块
- 🔐 **用户认证系统**: 注册/登录功能,自定义加密认证
- 📚 **教研模块**: 教学研究相关功能
- 🛠️ **服务模块**: 服务管理功能
- 👤 **个人中心**: 用户个人信息管理

### 技术亮点
- 基于 uniCloud 云函数/云对象架构
- 自定义用户认证系统(SHA256 + salt)
- 城市数据管理
- Token 自动管理(2小时有效期)
- 邀请码注册机制

## 🗂️ 项目结构

```
tangzai-uniapp/
├── pages/                    # 页面目录
│   ├── login/               # 登录页
│   ├── register/            # 注册页
│   ├── teaching/            # 教研页
│   ├── service/             # 服务页
│   └── mine/                # 我的页
├── components/              # 组件目录
├── api/                     # API 接口
├── utils/                   # 工具函数
├── static/                  # 静态资源
├── uniCloud-aliyun/         # 云端代码
│   ├── cloudfunctions/      # 云函数/云对象
│   │   ├── user/           # 用户认证
│   │   ├── agent/          # AI 代理管理
│   │   ├── web-card/       # 网页卡片管理
│   │   ├── feishu/         # 飞书卡片管理
│   │   └── chat/           # 聊天功能
│   └── database/            # 数据库 Schema
│       ├── cities.schema.json
│       ├── uni-id-users.schema.json
│       ├── agents.schema.json
│       ├── web-cards.schema.json
│       ├── feishu-cards.schema.json
│       ├── chat-history.schema.json
│       ├── departments.schema.json
│       └── models.schema.json
└── prototypes/              # 原型文件

```

## 🚀 快速开始

### 环境要求
- HBuilderX 4.85+
- Node.js (用于云函数开发)
- uniCloud 阿里云账号

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd tangzai-uniapp
   ```

2. **使用 HBuilderX 打开项目**
   - 打开 HBuilderX
   - 文件 → 打开目录 → 选择项目目录

3. **关联云服务空间**
   - 右键 `uniCloud-aliyun` 目录
   - 关联云服务空间
   - 选择或创建阿里云服务空间

4. **上传云函数和 Schema**
   ```powershell
   # 上传所有云函数
   & "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload all --prj tangzai-uniapp --provider aliyun
   
   # 上传数据库 Schema
   & "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload db --prj tangzai-uniapp --provider aliyun --name cities.schema.json
   ```

5. **运行项目**
   - 运行 → 运行到浏览器 → Chrome
   - 或运行到手机/模拟器

## 🔧 云函数管理

详细的 CLI 命令请参考 [WARP.md](./WARP.md)

### 常用命令

**上传单个云函数**
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload cloudfunction --prj tangzai-uniapp --provider aliyun --name user
```

**上传 Schema**
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload db --prj tangzai-uniapp --provider aliyun --name cities.schema.json
```

**列出云端云函数**
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --list cloudfunction --prj tangzai-uniapp --provider aliyun --cloud
```

## 📚 数据库 Schema

| 表名 | 描述 | 文件名 |
|------|------|--------|
| cities | 城市表 | cities.schema.json |
| uni-id-users | 用户表 | uni-id-users.schema.json |
| agents | AI代理表 | agents.schema.json |
| web-cards | 网页卡片表 | web-cards.schema.json |
| feishu-cards | 飞书卡片表 | feishu-cards.schema.json |
| chat-history | 聊天历史表 | chat-history.schema.json |
| departments | 部门表 | departments.schema.json |
| models | AI模型表 | models.schema.json |

## 🔐 用户认证

### 注册
- **必填字段**: 用户名、邮箱、手机号、密码、城市、邀请口令
- **邀请码**: `tangzai2025` (可通过环境变量 `INVITATION_CODE` 配置)
- **密码要求**: 至少 6 位
- **手机号格式**: 11位中国大陆手机号

### 登录
- **登录方式**: 手机号 + 密码
- **Token 有效期**: 2 小时

### 安全机制
- 密码采用 SHA256 + 固定 salt 加密存储
- Token 自动生成和过期管理
- 字段唯一性校验(用户名、邮箱、手机号)

## 📱 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/pages/login/login` | 登录页 | 应用启动页 |
| `/pages/register/register` | 注册页 | 用户注册 |
| `/pages/teaching/teaching` | 教研页 | Tab 页 |
| `/pages/service/service` | 服务页 | Tab 页 |
| `/pages/mine/mine` | 我的页 | Tab 页 |

## 🎨 主题配置

- **主色调**: #667eea (紫色)
- **导航栏**: #F8F8F8 (浅灰)
- **Tab 栏**: #ffffff (白色)

## 📝 开发注意事项

1. **云函数更新**: 修改云函数后需要重新上传才能生效
2. **Schema 修改**: 修改 Schema 后需要上传到云端
3. **Token 管理**: Token 存储在客户端,需要定期检查有效期
4. **城市数据**: 当前包含 11 个城市数据(上海1、上海2、北京、济南、沈阳等)

## 🛠️ 开发工具

- **HBuilderX**: 主要开发工具
- **HBuilderX CLI**: 云函数自动化上传工具
- **uniCloud Web 控制台**: 云端资源管理

## 📄 许可证

暂无

## 👥 联系方式

项目相关问题请联系项目负责人。

---

**最后更新**: 2025-11-15
