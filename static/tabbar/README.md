# TabBar 图标说明

## 📦 需要准备的图标文件

为了显示底部TabBar图标,需要准备以下10个PNG图标文件(每个Tab需要普通和激活两个状态):

### 图标列表

| Tab名称 | 普通状态图标 | 激活状态图标 | 建议图标 |
|---------|------------|-------------|---------|
| 工作台 | `workbench.png` | `workbench-active.png` | 📊 仪表盘/工作台图标 |
| 智能体 | `agent.png` | `agent-active.png` | 🤖 机器人/AI图标 |
| 我的服务 | `service.png` | `service-active.png` | 📋 列表/服务图标 |
| 学习中心 | `learning.png` | `learning-active.png` | 📚 书籍/学习图标 |
| 我的 | `mine.png` | `mine-active.png` | 👤 用户/个人图标 |

## 🎨 图标规格要求

- **尺寸**: 建议 81x81 像素(或 162x162 for @2x)
- **格式**: PNG (支持透明背景)
- **普通状态**: 灰色 (#8e8e93)
- **激活状态**: 紫色 (#4C12A1)
- **背景**: 透明

## 🔧 获取图标的方式

### 方式1: 使用 iconfont (推荐)
1. 访问 https://www.iconfont.cn/
2. 搜索对应的图标关键词
3. 下载PNG格式,分别保存为灰色和紫色版本

### 方式2: 使用 Icon Park
1. 访问 https://iconpark.oceanengine.com/
2. 选择合适的图标
3. 导出为PNG格式

### 方式3: 使用 Figma/Sketch
从原型图中直接导出图标

### 方式4: 临时使用 uni-icons
在没有准备图标之前,可以使用 uni-icons 组件,但性能不如PNG图标。

## 📝 临时解决方案

如果暂时没有图标文件,可以:
1. 移除 pages.json 中的 iconPath 配置,仅使用文字
2. 或者使用自定义TabBar组件

## 🚀 放置位置

所有图标文件应放置在:
```
static/tabbar/
├── workbench.png
├── workbench-active.png
├── agent.png
├── agent-active.png
├── service.png
├── service-active.png
├── learning.png
├── learning-active.png
├── mine.png
└── mine-active.png
```
