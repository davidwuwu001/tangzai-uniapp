<template>
  <view class="admin-page">
    <view class="admin-header">
      <text class="admin-title">模型管理</text>
      <button class="primary-btn" @click="openCreate">新增模型</button>
    </view>

    <scroll-view class="admin-content" scroll-y>
      <view v-if="loading" class="empty-tip">加载中...</view>
      <view v-else-if="models.length === 0" class="empty-tip">暂无模型</view>

      <view v-else class="table">
        <view class="table-header">
          <text class="col name">名称</text>
          <text class="col type">类型</text>
          <text class="col url">API 地址</text>
          <text class="col actions">操作</text>
        </view>
        <view
          class="table-row"
          v-for="item in models"
          :key="item._id"
        >
          <text class="col name">{{ item.name }}</text>
          <text class="col type">{{ item.model_type || 'openai' }}</text>
          <text class="col url">{{ item.api_url }}</text>
          <view class="col actions">
            <button size="mini" @click="openEdit(item)">编辑</button>
            <button size="mini" class="ml-8" type="warn" @click="confirmDelete(item)">删除</button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 新增/编辑弹层 -->
    <view v-if="showForm" class="modal-mask" @click="closeForm">
      <view class="modal" @click.stop>
        <text class="modal-title">{{ isEdit ? '编辑模型' : '新增模型' }}</text>
        <view class="form-item">
          <text class="label">名称</text>
          <input class="input" v-model="form.name" placeholder="例如：gpt-4.1" />
        </view>
        <view class="form-item">
          <text class="label">API 地址</text>
          <input class="input" v-model="form.api_url" placeholder="后端模型代理地址" />
        </view>
        <view class="form-item">
          <text class="label">API 密钥</text>
          <input class="input" v-model="form.api_key" placeholder="密钥（不会在前端展示明文）" password />
        </view>
        <view class="form-item">
          <text class="label">模型类型</text>
          <picker mode="selector" :range="modelTypes" @change="onTypeChange">
            <view class="picker-input">{{ currentTypeLabel }}</view>
          </picker>
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="closeForm">取消</button>
          <button class="ok-btn" type="primary" @click="submitForm">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import AdminApiService from '@/utils/admin-api-service.js';

export default {
  data() {
    return {
      loading: false,
      models: [],
      showForm: false,
      isEdit: false,
      currentId: null,
      modelTypes: ['openai', 'volcengine', 'custom'],
      form: {
        name: '',
        api_url: '',
        api_key: '',
        model_type: 'openai'
      }
    };
  },
  computed: {
    currentTypeLabel() {
      return this.form.model_type || 'openai';
    }
  },
  onLoad() {
    this.loadModels();
  },
  methods: {
    async loadModels() {
      this.loading = true;
      try {
        const list = await AdminApiService.model.list();
        this.models = Array.isArray(list) ? list : [];
      } catch (e) {
        console.error('加载模型失败:', e);
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.isEdit = false;
      this.currentId = null;
      this.form = {
        name: '',
        api_url: '',
        api_key: '',
        model_type: 'openai'
      };
      this.showForm = true;
    },
    openEdit(item) {
      this.isEdit = true;
      this.currentId = item._id;
      this.form = {
        name: item.name,
        api_url: item.api_url,
        api_key: item.api_key || '',
        model_type: item.model_type || 'openai'
      };
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
    },
    onTypeChange(e) {
      const index = Number(e.detail.value || 0);
      this.form.model_type = this.modelTypes[index] || 'openai';
    },
    async submitForm() {
      if (!this.form.name || !this.form.api_url || !this.form.api_key) {
        uni.showToast({ title: '名称、API 地址和密钥必填', icon: 'none' });
        return;
      }
      try {
        if (this.isEdit && this.currentId) {
          await AdminApiService.model.update({ id: this.currentId, ...this.form });
        } else {
          await AdminApiService.model.create(this.form);
        }
        this.showForm = false;
        this.loadModels();
      } catch (e) {
        console.error('保存模型失败:', e);
      }
    },
    confirmDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除模型「${item.name}」吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await AdminApiService.model.delete(item._id);
              this.loadModels();
            } catch (e) {
              console.error('删除模型失败:', e);
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
}

.admin-header {
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 2rpx solid #e5e7eb;
}

.admin-title {
  font-size: 32rpx;
  font-weight: 600;
}

.primary-btn {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
}

.admin-content {
  flex: 1;
  padding: 24rpx 32rpx 40rpx;
}

.empty-tip {
  text-align: center;
  color: #9ca3af;
  margin-top: 80rpx;
}

.table {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.table-header,
.table-row {
  display: flex;
  align-items: center;
  padding: 18rpx 24rpx;
}

.table-header {
  background-color: #f9fafb;
  font-size: 24rpx;
  color: #6b7280;
}

.table-row:nth-child(odd) {
  background-color: #ffffff;
}

.table-row:nth-child(even) {
  background-color: #f9fafb;
}

.col {
  font-size: 26rpx;
}

.col.name {
  flex: 1.2;
}

.col.type {
  flex: 0.8;
}

.col.url {
  flex: 1.8;
}

.col.actions {
  flex: 1.2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.ml-8 {
  margin-left: 16rpx;
}

.modal-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  width: 86%;
  max-width: 720rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 28rpx 24rpx;
}

.modal-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  margin-bottom: 12rpx;
}

.input {
  border-radius: 12rpx;
  border: 2rpx solid #e5e7eb;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
}

.picker-input {
  border-radius: 12rpx;
  border: 2rpx solid #e5e7eb;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  background-color: #f9fafb;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8rpx;
}

.cancel-btn {
  margin-right: 16rpx;
}

.ok-btn {
  min-width: 160rpx;
}
</style>
