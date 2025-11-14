# Day 3 任务清单 - 连接真实登录API

## 📋 任务概览
- **目标**: 实现真实登录功能，连接后端API
- **预计时间**: 2小时
- **依赖**: Day 1 登录页面 + Day 2 网络封装

---

## ✅ 任务列表

### 1. 修改登录页面调用真实API
- [x] 导入 loginAPI 方法
- [x] 改造 handleLogin 为 async 方法
- [x] 添加 try-catch 错误处理
- [x] 保存 token 到本地存储
- [x] 保存用户信息到本地存储
- [x] 登录成功后跳转首页

### 2. 实现自动登录功能
- [x] 添加 onLoad 生命周期
- [x] 检查本地是否有 token
- [x] 如果已登录，自动跳转首页

### 3. 配置后端地址
- [ ] 在 utils/config.js 中配置 BASE_URL
- [ ] 确认原 Next.js 后端是否在 Vercel 运行
- [ ] 测试跨域请求是否正常

### 4. 后端CORS配置（如需要）
- [ ] 检查后端是否允许跨域请求
- [ ] 配置 CORS 允许的域名
- [ ] 测试请求头是否正确

### 5. 测试登录流程
- [ ] 测试错误用户名密码
- [ ] 测试正确用户名密码
- [ ] 验证 token 是否正确保存
- [ ] 验证自动登录是否正常
- [ ] 验证跳转首页是否正常

---

## 🔧 技术要点

### 登录流程
```
用户输入 → 表单验证 → 调用API → 保存token/userInfo → 跳转首页
```

### 本地存储
- `auth_token`: JWT token
- `user_info`: 用户信息JSON字符串

### 自动登录逻辑
```
onLoad → 读取token → 有token → 跳转首页
                   → 无token → 停留登录页
```

---

## ⚠️ 注意事项

1. **后端地址配置**
   - 需要获取原 Next.js 项目的 Vercel 部署地址
   - BASE_URL 格式: `https://your-app.vercel.app`

2. **CORS问题**
   - uniapp 开发环境可能遇到跨域问题
   - 需要后端配置允许来源

3. **错误处理**
   - 网络错误已在 request.js 处理
   - 401 会自动清除 token 并跳转登录页
   - 其他错误显示 Toast 提示

4. **Token管理**
   - Token 存储在 uni.storage
   - 每次请求自动带上 Authorization header
   - Token 过期会触发重新登录

---

## 📝 下一步（Day 4）

完成 Day 3 后，进入 Day 4:
- 创建主页框架
- 实现底部导航栏
- 实现三个Tab页面切换
