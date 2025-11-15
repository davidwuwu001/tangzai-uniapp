<template>
  <view class="admin-page">
    <view class="admin-header">
      <text class="admin-title">用户管理</text>
    </view>

    <!-- 筛选区域 -->
    <view class="filter-bar">
      <picker mode="selector" :range="cityOptions" range-key="name" @change="onCityChange">
        <view class="filter-item">
          <text class="filter-label">城市：</text>
          <text class="filter-value">{{ currentCityLabel }}</text>
        </view>
      </picker>
      <picker mode="selector" :range="departmentOptions" range-key="name" @change="onDeptChange">
        <view class="filter-item">
          <text class="filter-label">部门：</text>
          <text class="filter-value">{{ currentDeptLabel }}</text>
        </view>
      </picker>
      <view class="filter-search">
        <input
          class="search-input"
          v-model="search"
          placeholder="搜索用户名/手机号"
          @confirm="loadUsers"
        />
        <button size="mini" class="ml-8" @click="loadUsers">查询</button>
      </view>
    </view>

    <scroll-view class="admin-content" scroll-y>
      <view v-if="loading" class="empty-tip">加载中...</view>
      <view v-else-if="users.length === 0" class="empty-tip">暂无用户数据</view>

      <view v-else class="table">
        <view class="table-header">
          <text class="col name">姓名</text>
          <text class="col mobile">手机号</text>
          <text class="col city">城市</text>
          <text class="col dept">部门</text>
          <text class="col admin">管理员</text>
          <text class="col actions">操作</text>
        </view>
        <view
          class="table-row"
          v-for="item in users"
          :key="item._id"
        >
          <text class="col name">{{ item.username || '-' }}</text>
          <text class="col mobile">{{ item.mobile || '-' }}</text>
          <text class="col city">{{ item.city_name || '-' }}</text>
          <text class="col dept">{{ item.department || '-' }}</text>
          <text class="col admin">{{ item.is_admin ? '是' : '否' }}</text>
          <view class="col actions">
            <button size="mini" @click="openEdit(item)">编辑</button>
            <button size="mini" class="ml-8" type="warn" @click="confirmReset(item)">重置密码</button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 编辑用户弹层 -->
    <view v-if="showForm" class="modal-mask" @click="closeForm">
      <view class="modal" @click.stop>
        <text class="modal-title">编辑用户</text>
        <view class="form-item">
          <text class="label">姓名</text>
          <input class="input" v-model="form.username" disabled />
        </view>
        <view class="form-item">
          <text class="label">城市</text>
          <picker mode="selector" :range="cityOptions" range-key="name" @change="onFormCityChange">
            <view class="picker-input">{{ formCityLabel }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">部门</text>
          <picker mode="selector" :range="departmentOptions" range-key="name" @change="onFormDeptChange">
            <view class="picker-input">{{ formDeptLabel }}</view>
          </picker>
        </view>
        <view class="form-item switch-row">
          <text class="label">是否管理员</text>
          <switch :checked="form.is_admin" @change="e => (form.is_admin = e.detail.value)" />
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
      users: [],
      page: 1,
      pageSize: 20,
      total: 0,
      // 筛选项
      cityOptions: [{ _id: '', name: '全部城市' }],
      departmentOptions: [{ _id: '', name: '全部部门' }],
      cityIndex: 0,
      deptIndex: 0,
      search: '',
      // 编辑表单
      showForm: false,
      currentId: null,
      form: {
        username: '',
        city: null,
        city_name: '',
        department: '',
        is_admin: false
      }
    };
  },
  computed: {
    currentCityLabel() {
      return this.cityOptions[this.cityIndex]?.name || '全部城市';
    },
    currentDeptLabel() {
      return this.departmentOptions[this.deptIndex]?.name || '全部部门';
    },
    formCityLabel() {
      const match = this.cityOptions.find((c) => c._id === this.form.city) || this.cityOptions[0];
      return match ? match.name : '请选择城市';
    },
    formDeptLabel() {
      const match = this.departmentOptions.find((d) => d.name === this.form.department) || this.departmentOptions[0];
      return match ? match.name : '请选择部门';
    }
  },
  onLoad() {
    this.initFilters();
    this.loadUsers();
  },
  methods: {
    async initFilters() {
      try {
        const [cities, depts] = await Promise.all([
          AdminApiService.city.list(),
          AdminApiService.department.list()
        ]);
        this.cityOptions = [{ _id: '', name: '全部城市' }].concat(
          (cities || []).map((c) => ({ _id: c._id, name: c.name, code: c.code }))
        );
        this.departmentOptions = [{ _id: '', name: '全部部门' }].concat(
          (depts || []).map((d) => ({ _id: d._id, name: d.name }))
        );
      } catch (e) {
        console.error('初始化筛选项失败:', e);
      }
    },
    async loadUsers() {
      this.loading = true;
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          search: this.search || ''
        };
        const cityItem = this.cityOptions[this.cityIndex];
        if (cityItem && cityItem._id) {
          params.city = cityItem._id;
        }
        const deptItem = this.departmentOptions[this.deptIndex];
        if (deptItem && deptItem.name && deptItem.name !== '全部部门') {
          params.department = deptItem.name;
        }
        const res = await AdminApiService.user.list(params);
        if (res && res.list) {
          this.users = res.list;
          this.total = res.total || res.list.length;
        } else if (Array.isArray(res)) {
          // 如果后端直接返回数组
          this.users = res;
          this.total = res.length;
        }
      } catch (e) {
        console.error('加载用户失败:', e);
      } finally {
        this.loading = false;
      }
    },
    onCityChange(e) {
      this.cityIndex = Number(e.detail.value || 0);
      this.loadUsers();
    },
    onDeptChange(e) {
      this.deptIndex = Number(e.detail.value || 0);
      this.loadUsers();
    },
    openEdit(item) {
      this.currentId = item._id;
      this.form = {
        username: item.username,
        city: item.city || null,
        city_name: item.city_name || '',
        department: item.department || '',
        is_admin: !!item.is_admin
      };
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
    },
    onFormCityChange(e) {
      const index = Number(e.detail.value || 0);
      const city = this.cityOptions[index];
      if (city) {
        this.form.city = city._id || null;
        this.form.city_name = city.name || '';
      }
    },
    onFormDeptChange(e) {
      const index = Number(e.detail.value || 0);
      const dept = this.departmentOptions[index];
      if (dept) {
        this.form.department = dept.name || '';
      }
    },
    async submitForm() {
      if (!this.currentId) {
        uni.showToast({ title: '缺少用户ID', icon: 'none' });
        return;
      }
      try {
        await AdminApiService.user.update({ id: this.currentId, ...this.form });
        this.showForm = false;
        this.loadUsers();
      } catch (e) {
        console.error('更新用户失败:', e);
      }
    },
    confirmReset(item) {
      uni.showModal({
        title: '重置密码',
        content: `确定要重置用户「${item.username || item.mobile}」的密码吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const data = await AdminApiService.user.resetPassword({ id: item._id });
              const pwd = data && data.newPassword;
              uni.showModal({
                title: '重置成功',
                content: pwd ? `新密码：${pwd}` : '密码已重置',
                showCancel: false
              });
            } catch (e) {
              console.error('重置密码失败:', e);
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
  flex: 1.5;
}

.col.mobile {
  flex: 1.5;
}

.col.city {
  flex: 1.2;
}

.col.dept {
  flex: 1.2;
}

.col.admin {
  flex: 0.8;
}

.col.actions {
  flex: 1.6;
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
  width: 82%;
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
