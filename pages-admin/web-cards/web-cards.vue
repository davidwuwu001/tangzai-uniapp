<template>
  <view class="admin-page">
    <view class="admin-header">
      <text class="admin-title">网页卡片管理</text>
      <button class="primary-btn" @click="openCreate">新增卡片</button>
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
          placeholder="搜索标题/描述"
          @confirm="loadCards"
        />
        <button size="mini" class="ml-8" @click="loadCards">查询</button>
      </view>
    </view>

    <scroll-view class="admin-content" scroll-y>
      <view v-if="loading" class="empty-tip">加载中...</view>
      <view v-else-if="cards.length === 0" class="empty-tip">暂无网页卡片</view>

      <view v-else class="table">
        <view class="table-header">
          <text class="col title">标题</text>
          <text class="col url">URL</text>
          <text class="col nav">导航</text>
          <text class="col city">城市权限</text>
          <text class="col status">启用</text>
          <text class="col actions">操作</text>
        </view>
        <view
          class="table-row"
          v-for="item in cards"
          :key="item._id"
        >
          <text class="col title">{{ item.title }}</text>
          <text class="col url">{{ item.url }}</text>
          <text class="col nav">{{ item.navigation_tab || '-' }}</text>
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

    <!-- 新增/编辑弹层 -->
    <view v-if="showForm" class="modal-mask" @click="closeForm">
      <view class="modal" @click.stop>
        <text class="modal-title">{{ isEdit ? '编辑卡片' : '新增卡片' }}</text>
        <view class="form-item">
          <text class="label">标题</text>
          <input class="input" v-model="form.title" placeholder="请输入标题" />
        </view>
        <view class="form-item">
          <text class="label">URL</text>
          <input class="input" v-model="form.url" placeholder="请输入网页地址" />
        </view>
        <view class="form-item">
          <text class="label">描述</text>
          <textarea class="textarea" v-model="form.description" placeholder="请输入描述" />
        </view>
        <view class="form-item">
          <text class="label">导航标签</text>
          <input class="input" v-model="form.navigation_tab" placeholder="如：服务" />
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
      cards: [],
      navigationTabs: ['全部', '教研', '服务'],
      navIndex: 0,
      search: '',
      showForm: false,
      isEdit: false,
      currentId: null,
      form: {
        title: '',
        description: '',
        url: '',
        navigation_tab: '服务',
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
    this.loadCards();
  },
  methods: {
    async loadCards() {
      this.loading = true;
      try {
        const params = {
          navigation_tab: this.navIndex === 0 ? 'all' : this.navigationTabs[this.navIndex],
          search_keyword: this.search || ''
        };
        const res = await AdminApiService.webCard.list(params);
        if (res && res.list) {
          this.cards = res.list;
        } else if (Array.isArray(res)) {
          this.cards = res;
        }
      } catch (e) {
        console.error('加载网页卡片失败:', e);
      } finally {
        this.loading = false;
      }
    },
    onNavChange(e) {
      this.navIndex = Number(e.detail.value || 0);
      this.loadCards();
    },
    openCreate() {
      this.isEdit = false;
      this.currentId = null;
      this.form = {
        title: '',
        description: '',
        url: '',
        navigation_tab: '服务',
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
        title: item.title,
        description: item.description || '',
        url: item.url || '',
        navigation_tab: item.navigation_tab || '服务',
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
      if (!this.form.title || !this.form.url) {
        uni.showToast({ title: '标题和 URL 必填', icon: 'none' });
        return;
      }
      try {
        const payload = {
          ...this.form,
          cities: this.parseCitiesInput()
        };
        if (this.isEdit && this.currentId) {
          await AdminApiService.webCard.update({ card_id: this.currentId, ...payload });
        } else {
          await AdminApiService.webCard.create(payload);
        }
        this.showForm = false;
        this.loadCards();
      } catch (e) {
        console.error('保存卡片失败:', e);
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
        await AdminApiService.webCard.update({ card_id: item._id, is_active: value });
        item.is_active = value;
      } catch (e) {
        console.error('切换状态失败:', e);
      }
    },
    confirmDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除卡片「${item.title}」吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await AdminApiService.webCard.delete(item._id);
              this.loadCards();
            } catch (e) {
              console.error('删除卡片失败:', e);
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

.col.title {
  flex: 1.4;
}

.col.url {
  flex: 1.8;
}

.col.nav {
  flex: 1;
}

.col.city {
  flex: 1.2;
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