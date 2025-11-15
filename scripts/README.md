# MySQL → MongoDB 用户数据迁移指南

## 📋 迁移步骤

### 步骤1：配置MySQL连接信息

编辑 `migrate-users-from-mysql.js` 文件，修改第 16 行的 `host` 地址：

```javascript
const MYSQL_CONFIG = {
  host: '填写您的MySQL服务器地址',  // 替换为实际主机地址
  port: 3306,
  user: 'xhs-haushu',
  password: '7788Gg7788',
  database: 'xhs-haushu'
};
```

### 步骤2：运行导出脚本

```powershell
cd D:\Project\tangzai-zhushou-uniapp\tangzai-uniapp\scripts
npm run migrate
```

**预期输出：**
- ✅ MySQL 连接成功
- ✅ 导出 X 条用户数据
- ✅ 转换完成 X 条数据
- ✅ 数据已保存到 JSON 文件
- 📁 文件路径: migration-output/users-data.json

### 步骤3：上传import-users云函数

```powershell
& "D:\KwDownload\HBuilderX.4.85.2025110510\HBuilderX\cli.exe" cloud functions --upload cloudfunction --prj tangzai-uniapp --provider aliyun --name import-users
```

### 步骤4：导入数据到MongoDB

有两种方式：

#### 方式A：通过前端页面调用云函数（推荐）

创建一个临时页面调用云函数：

```vue
<template>
  <view class="container">
    <button @click="importUsers">导入用户数据</button>
    <text>{{ message }}</text>
  </view>
</template>

<script>
export default {
  data() {
    return {
      message: ''
    }
  },
  methods: {
    async importUsers() {
      try {
        // 读取导出的JSON文件内容
        const usersData = require('../scripts/migration-output/users-data.json');
        
        this.message = '开始导入...';
        
        const importUsersObj = uniCloud.importObject('import-users');
        
        // 使用去重导入
        const result = await importUsersObj.importWithDedupe(usersData);
        
        this.message = result.message;
        console.log('导入结果:', result);
      } catch (e) {
        this.message = '导入失败: ' + e.message;
        console.error(e);
      }
    }
  }
}
</script>
```

#### 方式B：通过uniCloud Web控制台

1. 登录 [uniCloud 控制台](https://unicloud.dcloud.net.cn)
2. 选择您的服务空间
3. 进入「云数据库」→「uni-id-users」表
4. 点击「导入」按钮
5. 上传 `migration-output/users-data.json` 文件
6. 选择「插入新记录」模式
7. 点击「开始导入」

### 步骤5：验证导入结果

调用云函数检查：

```javascript
const importUsersObj = uniCloud.importObject('import-users');
const result = await importUsersObj.checkExisting();
console.log('当前用户数量:', result.total);
console.log('最近用户:', result.recentUsers);
```

## 🔧 云函数方法说明

### import-users 云对象方法

#### 1. batchImport(users)
批量导入用户数据（不检查重复）

**参数：**
- `users`: Array - 用户数据数组

**返回：**
```javascript
{
  success: true,
  message: "导入完成：成功 X 条，失败 X 条",
  total: 100,
  successCount: 100,
  errorCount: 0
}
```

#### 2. importWithDedupe(users)
去重导入（根据手机号检查，已存在的不导入）

**参数：**
- `users`: Array - 用户数据数组

**返回：**
```javascript
{
  success: true,
  message: "导入完成：成功 X 条，失败 X 条",
  total: 100,
  existing: 20,
  imported: 80
}
```

#### 3. checkExisting()
检查表中现有用户数量

**返回：**
```javascript
{
  success: true,
  total: 100,
  recentUsers: [...]
}
```

#### 4. clearAll(confirmCode)
清空表（⚠️ 谨慎使用）

**参数：**
- `confirmCode`: String - 必须是 "CONFIRM_DELETE_ALL"

**返回：**
```javascript
{
  success: true,
  message: "已删除 X 条记录",
  deleted: 100
}
```

## 📝 注意事项

1. **MySQL表结构：** 脚本假设MySQL表名为 `users`，如果不同请修改第45行的SQL查询
2. **字段映射：** 脚本会自动映射常见字段名，如需调整请修改 `transformUserData` 函数
3. **密码安全：** 密码会保持原加密格式直接复制
4. **数据备份：** 导入前建议先备份现有MongoDB数据
5. **分批导入：** 云函数自动分批导入，每批50条，避免超时

## 🔍 故障排查

### MySQL连接失败
- 检查服务器地址、端口是否正确
- 确认用户名密码正确
- 检查防火墙是否允许连接

### 导入失败
- 检查MongoDB Schema是否已上传
- 查看云函数日志获取详细错误信息
- 确认必填字段是否完整

### 数据格式错误
- 检查 `migration-output/users-data.json` 文件内容
- 验证必填字段（username）是否存在
- 确认数据类型是否符合Schema定义

## 📞 需要帮助？

如遇到问题，请提供：
1. 错误信息截图
2. 云函数日志
3. users-data.json 示例数据（脱敏后）
