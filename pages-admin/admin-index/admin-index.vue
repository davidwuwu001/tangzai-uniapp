<template>
  <view class="admin-page">
    <!-- 顶部栏 -->
    <view class="admin-header">
      <view class="admin-title-row">
        <text class="admin-title">管理面板</text>
        <text class="admin-env-tag">H5 管理端</text>
      </view>
      <view class="admin-user-row" v-if="user">
        <view class="admin-avatar">
          <text>{{ avatarEmoji }}</text>
        </view>
        <view class="admin-user-info">
          <text class="admin-user-name">{{ user.username || user.name || '管理员' }}</text>
          <text class="admin-user-role">
            {{ isSystemAdmin ? '系统管理员' : '城市管理员' }} · {{ user.city_name || '全部城市' }}
          </text>
        </view>
      </view>
      <view v-else class="admin-user-row">
        <text class="admin-warning">未获取到用户信息，请重新登录后再访问管理端。</text>
      </view>
    </view>

    <!-- 管理模块入口网格 -->
    <scroll-view class="admin-content" scroll-y>
      <view class="module-grid">
        <view
          v-for="item in visibleModules"
          :key="item.id"
          class="module-card"
          @click="goModule(item)"
        >
          <view class="module-icon" :style="{ backgroundColor: item.iconBg }">
            <text>{{ item.icon }}</text>
          </view>
          <view class="module-info">
            <text class="module-title">{{ item.title }}</text>
            <text class="module-desc">{{ item.desc }}</text>
          </view>
          <text class="module-arrow">›</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      isAdmin: false,
      isSystemAdmin: false,
      modules: [
        {
          id: 'users',
          title: '用户管理',
          desc: '管理系统用户、权限与状态',
          icon: '👥',
          iconBg: '#EEF2FF',
          path: '/pages-admin/users/users',
          minRole: 'city-admin'
        },
        {
          id: 'cities',
          title: '城市管理',
          desc: '配置城市列表与启用状态',
          icon: '🌆',
          iconBg: '#ECFEFF',
          path: '/pages-admin/cities/cities',
          minRole: 'system-admin'
        },
        {
          id: 'departments',
          title: '部门管理',
          desc: '维护部门信息与排序',
          icon: '🏢',
          iconBg: '#FEE2E2',
          path: '/pages-admin/departments/departments',
          minRole: 'city-admin'
        },
        {
          id: 'agents',
          title: '智能体管理',
          desc: '配置智能体参数与权限',
          icon: '🤖',
          iconBg: '#DCFCE7',
          path: '/pages-admin/agents/agents',
          minRole: 'city-admin'
        },
        {
          id: 'web-cards',
          title: '网页卡片管理',
          desc: '维护网页卡片与导航入口',
          icon: '📰',
          iconBg: '#FEF9C3',
          path: '/pages-admin/web-cards/web-cards',
          minRole: 'city-admin'
        },
        {
          id: 'feishu-cards',
          title: '飞书卡片管理',
          desc: '管理飞书看板与数据卡片',
          icon: '📊',
          iconBg: '#E0F2FE',
          path: '/pages-admin/feishu-cards/feishu-cards',
          minRole: 'system-admin'
        },
        {
          id: 'models',
          title: '模型管理',
          desc: '配置 AI 模型 API 接入',
          icon: '🧠',
          iconBg: '#E0F2FE',
          path: '/pages-admin/models/models',
          minRole: 'system-admin'
        }
      ]
    };
  },
  computed: {
    avatarEmoji() {
      if (!this.user) return '👤';
      return this.user.is_admin ? '🛠' : '👤';
    },
    visibleModules() {
      if (!this.isAdmin) return [];
      return this.modules.filter((m) => {
        if (m.minRole === 'system-admin') {
          return this.isSystemAdmin;
        }
        return true;
      });
    }
  },
  onLoad() {
    this.initUser();
  },
  methods: {
    initUser() {
      try {
        const stored = uni.getStorageSync('user_info');
        if (!stored) {
          this.isAdmin = false;
          this.user = null;
          return;
        }
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        this.user = parsed;
        this.isAdmin = !!parsed.is_admin;
        // 约定：is_admin = true 且没有 city 视为系统管理员
        this.isSystemAdmin = !!parsed.is_admin && (parsed.city == null || parsed.city === '');
        if (!this.isAdmin) {
          uni.showToast({ title: '当前账号无管理权限', icon: 'none' });
        }
      } catch (e) {
        console.error('解析用户信息失败:', e);
        this.isAdmin = false;
        this.user = null;
      }
    },
    goModule(item) {
      if (!item.path) {
        uni.showToast({
          title: '该模块页面待开发',
          icon: 'none'
        });
        return;
      }
      uni.navigateTo({ url: item.path });
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
  background: linear-gradient(135deg, #4c12a1, #7c3aed);
  padding: 24rpx 40rpx 40rpx;
  color: #ffffff;
}

.admin-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.admin-title {
  font-size: 36rpx;
  font-weight: 700;
}

.admin-env-tag {
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background-color: rgba(255, 255, 255, 0.18);
}

.admin-user-row {
  display: flex;
  align-items: center;
}

.admin-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background-color: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  font-size: 52rpx;
}

.admin-user-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.admin-user-name {
  font-size: 32rpx;
  font-weight: 600;
}

.admin-user-role {
  font-size: 24rpx;
  opacity: 0.9;
}

.admin-warning {
  font-size: 24rpx;
  opacity: 0.9;
}

.admin-content {
  flex: 1;
  padding: 32rpx;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320rpx, 1fr));
  grid-gap: 24rpx;
}

.module-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx 24rpx 24rpx 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 16rpx rgba(15, 23, 42, 0.08);
}

.module-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 40rpx;
}

.module-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.module-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #111827;
}

.module-desc {
  font-size: 24rpx;
  color: #6b7280;
}

.module-arrow {
  font-size: 36rpx;
  color: #d1d5db;
}
</style>
