# HBuilderX CLI 自动化规则

## 项目信息
- **项目名称**: tangzai-uniapp
- **项目路径**: D:\Project\tangzai-zhushou-uniapp\tangzai-uniapp
- **云服务商**: aliyun (阿里云)
- **HBuilderX CLI 路径**: D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe

## CLI 命令模板

### 上传云函数/云对象
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload cloudfunction --prj tangzai-uniapp --provider aliyun --name <云函数名>
```

### 
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload all --prj tangzai-uniapp --provider aliyun
```

### 上传 DB Schema
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload db --prj tangzai-uniapp --provider aliyun --name <schema文件名.schema.json>
```

### 上传公共模块
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload common --prj tangzai-uniapp --provider aliyun --name <模块名>
```

### 下载云函数
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --download cloudfunction --prj tangzai-uniapp --provider aliyun --name <云函数名>
```

### 列出云空间
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --list space --prj tangzai-uniapp --provider aliyun
```

### 列出云端云函数
```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --list cloudfunction --prj tangzai-uniapp --provider aliyun --cloud
```

## 项目云函数/云对象列表
- user (用户认证)
- agent (AI代理管理)
- web-card (网页卡片管理)
- feishu (飞书卡片管理)
- chat (聊天功能)

## 数据库 Schema 列表
- cities.schema.json (城市表)
- departments.schema.json (部门表)
- models.schema.json (AI模型表)
- uni-id-users.schema.json (用户表)
- agents.schema.json (代理表)
- web-cards.schema.json (网页卡片表)
- feishu-cards.schema.json (飞书卡片表)
- chat-history.schema.json (聊天历史表)

## 自动化指令约定

当用户说:
- "上传 user 云函数" → 执行上传 user 云函数命令
- "上传 cities.schema.json" → 执行上传 DB Schema 命令
- "上传所有云函数" → 执行上传 all 命令
- "列出云端云函数" → 执行 list cloudfunction 命令

**注意事项**:
1. 所有命令使用 PowerShell 语法 (& 操作符)
2. 路径包含空格时需要用引号包裹
3. 云函数名称不包含路径,只需要目录名
4. Schema 文件名需要包含 .schema.json 后缀
5. 默认使用 aliyun 服务商
