<template>
  <view class="admin-page">
    <view class="admin-header">
      <text class="admin-title">智能体管理</text>
      <button class="primary-btn" @click="openCreate">新增智能体</button>
    </view>

    <!-- 筛选区域 -->
    <view class="filter-bar">
      <picker mode="selector" :range="navigationTabs" @change="onNavChange">
        <view class="filter-item">
          <text class="filter-label">导航：</text>
          <text class="filter-value">{{ currentNavLabel }}</text>
        </view>
      </picker>
      <view class="filter-search">
        <input
          class="search-input"
          v-model="search"
          placeholder="搜索名称/描述"
          @confirm="loadAgents"
        />
        <button size="mini" class="ml-8" @click="loadAgents">查询</button>
      </view>
    </view>

    <scroll-view class="admin-content" scroll-y>
      <view v-if="loading" class="empty-tip">加载中...</view>
      <view v-else-if="agents.length === 0" class="empty-tip">暂无智能体</view>

      <view v-else class="table">
        <view class="table-header">
          <text class="col name">名称</text>
          <text class="col nav">导航</text>
          <text class="col model">模型</text>
          <text class="col city">城市权限</text>
          <text class="col status">启用</text>
          <text class="col actions">操作</text>
        </view>
        <view
          class="table-row"
          v-for="item in agents"
          :key="item._id"
        >
          <text class="col name">{{ item.name }}</text>
          <text class="col nav">{{ item.navigation_tab || '-' }}</text>
          <text class="col model">{{ item.model_id || '-' }}</text>
          <text class="col city">{{ formatCities(item.cities) }}</text>
          <view class="col status">
            <switch :checked="item.is_active" @change="onToggleActive(item, $event)" />
          </view>
          <view class="col actions">
            <button size="mini" @click="openEdit(item)">编辑</button>
            <button size="mini" class="ml-8" type="warn" @click="confirmDelete(item)">删除</button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 新增/编辑弹层：简单版本，只覆盖核心字段 -->
    <view v-if="showForm" class="modal-mask" @click="closeForm">
      <view class="modal" @click.stop>
        <text class="modal-title">{{ isEdit ? '编辑智能体' : '新增智能体' }}</text>
        <view class="form-item">
          <text class="label">名称</text>
          <input class="input" v-model="form.name" placeholder="请输入名称" />
        </view>
        <view class="form-item">
          <text class="label">描述</text>
          <textarea class="textarea" v-model="form.description" placeholder="请输入描述" />
        </view>
        <view class="form-item">
          <text class="label">System Prompt</text>
          <textarea class="textarea" v-model="form.system_prompt" placeholder="请输入提示词" />
        </view>
        <view class="form-item">
          <text class="label">导航标签</text>
          <input class="input" v-model="form.navigation_tab" placeholder="如：教研/服务" />
        </view>
        <view class="form-item">
          <text class="label">适用城市（逗号分隔，留空为 all）</text>
          <input class="input" v-model="citiesInput" placeholder="例如：上海,北京" />
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
      agents: [],
      navigationTabs: ['全部', '教研', '服务'],
      navIndex: 0,
      search: '',
      showForm: false,
      isEdit: false,
      currentId: null,
      form: {
        name: '',
        description: '',
        system_prompt: '',
        navigation_tab: '教研',
        cities: ['all'],
        is_active: true
      },
      citiesInput: ''
    };
  },
  computed: {
    currentNavLabel() {
      return this.navigationTabs[this.navIndex] || '全部';
    }
  },
  onLoad() {
    this.loadAgents();
  },
  methods: {
    async loadAgents() {
      this.loading = true;
      try {
        const params = {
          navigation_tab: this.navIndex === 0 ? 'all' : this.navigationTabs[this.navIndex],
          search_keyword: this.search || ''
        };
        const res = await AdminApiService.agent.list(params);
        if (res && res.list) {
          this.agents = res.list;
        } else if (Array.isArray(res)) {
          this.agents = res;
        }
      } catch (e) {
        console.error('加载智能体失败:', e);
      } finally {
        this.loading = false;
      }
    },
    onNavChange(e) {
      this.navIndex = Number(e.detail.value || 0);
      this.loadAgents();
    },
    openCreate() {
      this.isEdit = false;
      this.currentId = null;
      this.form = {
        name: '',
        description: '',
        system_prompt: '',
        navigation_tab: '教研',
        cities: ['all'],
        is_active: true
      };
      this.citiesInput = '';
      this.showForm = true;
    },
    openEdit(item) {
      this.isEdit = true;
      this.currentId = item._id;
      this.form = {
        name: item.name,
        description: item.description || '',
        system_prompt: item.system_prompt || '',
        navigation_tab: item.navigation_tab || '教研',
        cities: item.cities || ['all'],
        is_active: item.is_active !== false
      };
      this.citiesInput = this.form.cities && this.form.cities[0] !== 'all'
        ? this.form.cities.join(',')
        : '';
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
    },
    parseCitiesInput() {
      if (!this.citiesInput || !this.citiesInput.trim()) return ['all'];
      return this.citiesInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s);
    },
    async submitForm() {
      if (!this.form.name || !this.form.system_prompt) {
        uni.showToast({ title: '名称和 Prompt 必填', icon: 'none' });
        return;
      }
      try {
        const payload = {
          ...this.form,
          cities: this.parseCitiesInput()
        };
        if (this.isEdit && this.currentId) {
          await AdminApiService.agent.update({ agent_id: this.currentId, ...payload });
        } else {
          await AdminApiService.agent.create(payload);
        }
        this.showForm = false;
        this.loadAgents();
      } catch (e) {
        console.error('保存智能体失败:', e);
      }
    },
    formatCities(cities) {
      if (!cities || !cities.length) return '-';
      if (cities.includes('all')) return '全部';
      return cities.join(',');
    },
    async onToggleActive(item, event) {
      const value = event.detail.value;
      try {
        await AdminApiService.agent.update({ agent_id: item._id, is_active: value });
        item.is_active = value;
      } catch (e) {
        console.error('切换状态失败:', e);
      }
    },
    confirmDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除智能体「${item.name}」吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await AdminApiService.agent.delete(item._id);
              this.loadAgents();
            } catch (e) {
              console.error('删除智能体失败:', e);
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

.filter-bar {
  background-color: #ffffff;
  padding: 16rpx 32rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16rpx;
  border-bottom: 2rpx solid #e5e7eb;
}

.filter-item {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background-color: #f3f4f6;
  font-size: 24rpx;
  display: flex;
  align-items: center;
}

.filter-label {
  color: #6b7280;
}

.filter-value {
  color: #111827;
}

.filter-search {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.search-input {
  flex: 1;
  max-width: 340rpx;
  border-radius: 999rpx;
  border: 2rpx solid #e5e7eb;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
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

.col.nav {
  flex: 1;
}

.col.model {
  flex: 1.2;
}

.col.city {
  flex: 1.4;
}

.col.status {
  flex: 0.8;
  display: flex;
  justify-content: center;
}

.col.actions {
  flex: 1.4;
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
  width: 88%;
  max-width: 760rpx;
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
