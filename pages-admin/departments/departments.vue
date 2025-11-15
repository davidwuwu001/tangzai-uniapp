<template>
  <view class="admin-page">
    <view class="admin-header">
      <text class="admin-title">部门管理</text>
      <button class="primary-btn" @click="openCreate">新增部门</button>
    </view>

    <scroll-view class="admin-content" scroll-y>
      <view v-if="loading" class="empty-tip">加载中...</view>
      <view v-else-if="departments.length === 0" class="empty-tip">暂无部门数据</view>

      <view v-else class="table">
        <view class="table-header">
          <text class="col name">部门名称</text>
          <text class="col desc">描述</text>
          <text class="col sort">排序</text>
          <text class="col status">启用</text>
          <text class="col actions">操作</text>
        </view>
        <view
          class="table-row"
          v-for="item in departments"
          :key="item._id"
        >
          <text class="col name">{{ item.name }}</text>
          <text class="col desc">{{ item.description || '-' }}</text>
          <view class="col sort">
            <input
              class="sort-input"
              type="number"
              v-model.number="item.sort_order"
              @blur="updateSort(item)"
            />
          </view>
          <view class="col status">
            <switch :checked="item.is_active" @change="onToggleActive(item, $event)" />
          </view>
          <view class="col actions">
            <button size="mini" @click="openEdit(item)">编辑</button>
            <button size="mini" type="warn" class="ml-8" @click="confirmDelete(item)">删除</button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 新增/编辑弹层 -->
    <view v-if="showForm" class="modal-mask" @click="closeForm">
      <view class="modal" @click.stop>
        <text class="modal-title">{{ isEdit ? '编辑部门' : '新增部门' }}</text>
        <view class="form-item">
          <text class="label">部门名称</text>
          <input class="input" v-model="form.name" placeholder="请输入部门名称" />
        </view>
        <view class="form-item">
          <text class="label">描述</text>
          <textarea class="textarea" v-model="form.description" placeholder="请输入部门描述（可选）" />
        </view>
        <view class="form-item">
          <text class="label">排序</text>
          <input class="input" type="number" v-model.number="form.sort_order" placeholder="数字越大越靠前" />
        </view>
        <view class="form-item switch-row">
          <text class="label">是否启用</text>
          <switch :checked="form.is_active" @change="e => (form.is_active = e.detail.value)" />
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
      departments: [],
      showForm: false,
      isEdit: false,
      currentId: null,
      form: {
        name: '',
        description: '',
        sort_order: 0,
        is_active: true
      }
    };
  },
  onLoad() {
    this.loadDepartments();
  },
  methods: {
    async loadDepartments() {
      this.loading = true;
      try {
        const list = await AdminApiService.department.list();
        this.departments = Array.isArray(list) ? list : [];
      } catch (e) {
        console.error('加载部门失败:', e);
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.isEdit = false;
      this.currentId = null;
      this.form = { name: '', description: '', sort_order: 0, is_active: true };
      this.showForm = true;
    },
    openEdit(item) {
      this.isEdit = true;
      this.currentId = item._id;
      this.form = {
        name: item.name,
        description: item.description || '',
        sort_order: item.sort_order || 0,
        is_active: item.is_active !== false
      };
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
    },
    async submitForm() {
      if (!this.form.name) {
        uni.showToast({ title: '部门名称必填', icon: 'none' });
        return;
      }
      try {
        if (this.isEdit && this.currentId) {
          await AdminApiService.department.update({ id: this.currentId, ...this.form });
        } else {
          await AdminApiService.department.create(this.form);
        }
        this.showForm = false;
        this.loadDepartments();
      } catch (e) {
        console.error('保存部门失败:', e);
      }
    },
    async onToggleActive(item, event) {
      const value = event.detail.value;
      try {
        await AdminApiService.department.update({ id: item._id, is_active: value });
        item.is_active = value;
      } catch (e) {
        console.error('切换状态失败:', e);
      }
    },
    async updateSort(item) {
      try {
        await AdminApiService.department.update({ id: item._id, sort_order: item.sort_order || 0 });
      } catch (e) {
        console.error('更新排序失败:', e);
      }
    },
    confirmDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除部门「${item.name}」吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await AdminApiService.department.delete(item._id);
              this.loadDepartments();
            } catch (e) {
              console.error('删除部门失败:', e);
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
  flex: 1.6;
}

.col.desc {
  flex: 2;
}

.col.sort {
  flex: 1;
}

.col.status {
  flex: 1;
  display: flex;
  justify-content: center;
}

.col.actions {
  flex: 1.4;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.sort-input {
  width: 120rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e5e7eb;
  padding: 8rpx 12rpx;
  font-size: 24rpx;
  text-align: center;
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
  width: 80%;
  max-width: 680rpx;
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

.textarea {
  min-height: 140rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e5e7eb;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
