# Schema 批量上传指南

## 📋 需要上传的 8 个 Schema 文件

| 序号 | 表名 | Schema 文件 | 路径 |
|------|------|------------|------|
| 1 | uni-id-users | uni-id-users.schema.json | uniCloud-aliyun/database/ |
| 2 | agents | agents.schema.json | uniCloud-aliyun/database/ |
| 3 | web-cards | web-cards.schema.json | uniCloud-aliyun/database/ |
| 4 | feishu-cards | feishu-cards.schema.json | uniCloud-aliyun/database/ |
| 5 | departments | departments.schema.json | uniCloud-aliyun/database/ |
| 6 | cities | cities.schema.json | uniCloud-aliyun/database/ |
| 7 | models | models.schema.json | uniCloud-aliyun/database/ |
| 8 | chat-history | chat-history.schema.json | uniCloud-aliyun/database/ |

---

## 🚀 快速上传步骤（每个表约 30 秒）

### 方法 1: HBuilderX 右键上传（推荐）⚡

1. **在 HBuilderX 项目中**
2. 展开 `uniCloud-aliyun/database/` 目录
3. **右键** `uni-id-users.schema.json`
4. 选择 **上传 DB Schema**
5. 确认服务空间
6. 等待上传成功提示
7. **重复步骤 3-6**，依次上传其他 7 个文件

**预计总耗时：4-5 分钟**

---

### 方法 2: Web 控制台手动粘贴（备用）

如果 HBuilderX 右键没有"上传 DB Schema"选项：

1. 打开 uniCloud Web 控制台
2. 进入 云数据库 → 数据库集合管理
3. 点击表名（如 `uni-id-users`）
4. 点击 **编辑 DB Schema** 按钮
5. 打开本地对应的 `.schema.json` 文件
6. **全选复制**文件内容
7. **粘贴**到 Schema 编辑器
8. 点击 **保存**
9. 重复 3-8 步骤，完成其他 7 个表

**预计总耗时：8-10 分钟**

---

## ✅ 上传后验证

上传完成后，在 Web 控制台检查：

1. 每个表都能看到 **"表结构"** 标签页
2. 点击"表结构"，能看到完整的字段列表
3. 字段有类型、必填、默认值等约束

---

## 🎯 上传完成后

Schema 上传完成后，就可以进入 **Day 3: 数据导出与转换**了！

---

**提示**：如果使用 HBuilderX 右键上传，可以一次选中多个 `.schema.json` 文件批量上传，更快！
