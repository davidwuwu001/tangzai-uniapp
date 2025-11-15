# TabBar 图标方案

由于原型图中的SVG图标URL已失效,我们有以下几种替代方案:

## 方案1: 使用uni-icons组件库 (推荐)

uni-icons是uniapp官方的图标组件库,无需额外配置。

```bash
npm install @dcloudio/uni-ui
```

然后在pages.json中使用text属性即可(已实现emoji方案)

## 方案2: 使用iconfont

1. 访问 https://www.iconfont.cn/
2. 搜索并下载以下图标:
   - 工作台: "dashboard" 或 "workbench"  
   - 智能体: "robot" 或 "ai"
   - 服务: "list" 或 "service"
   - 学习中心: "book" 或 "study"
   - 我的: "user" 或 "profile"

## 方案3: 自定义TabBar组件

使用uniapp的自定义TabBar功能,通过组件实现更灵活的样式。

## 当前方案: Emoji图标

目前使用emoji作为临时图标方案:
- 📋 工作台
- 🤖 智能体
- 📋 服务  
- 📚 学习
- 👤 我的

这个方案简单有效,跨平台兼容性好。
