<template>
  <view class="mine-page">
    <!-- 头部用户信息区 -->
    <view class="profile-header">
      <view class="user-info">
        <view class="avatar-container">
          <view class="user-avatar">
            <text>{{ userInfo.avatar }}</text>
          </view>
          <view class="avatar-badge">✓</view>
        </view>
        <view class="user-details">
          <text class="user-name">{{ userInfo.name }}</text>
          <text class="user-role">{{ userInfo.role }}</text>
          <view class="user-department">
            <text>📍 {{ userInfo.city }} · {{ userInfo.department }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ stats.consultations }}</text>
        <text class="stat-label">咨询次数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.students }}</text>
        <text class="stat-label">服务学员</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.materials }}</text>
        <text class="stat-label">学习资料</text>
      </view>
    </view>
    
    <!-- 菜单内容 -->
    <view class="content">
      <view 
        v-for="(section, sectionIndex) in menuSections" 
        :key="sectionIndex" 
        class="menu-section"
      >
        <text class="section-title">{{ section.title }}</text>
        <view class="menu-card">
          <view 
            v-for="(item, itemIndex) in section.items" 
            :key="itemIndex"
            class="menu-item"
            @click="handleMenuClick(item)"
          >
            <view class="menu-icon" :class="item.iconClass">
              <text>{{ item.icon }}</text>
            </view>
            <view class="menu-content">
              <text class="menu-title">{{ item.title }}</text>
              <text class="menu-desc">{{ item.desc }}</text>
            </view>
            <text v-if="item.badge" class="menu-badge">{{ item.badge }}</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
      
      <!-- 退出按钮 -->
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
import profileData from '@/mock/profile.js';

export default {
  data() {
    return {
      userInfo: {},
      stats: {},
      menuSections: []
    };
  },
  
  onLoad() {
    this.loadData();
    this.mergeUserFromStorage();
    this.injectAdminEntry();
  },
  
  methods: {
    loadData() {
      this.userInfo = profileData.userInfo;
      this.stats = profileData.stats;
      this.menuSections = profileData.menuSections;
    },
    // 合并登录后真实用户信息（如有）
    mergeUserFromStorage() {
      try {
        const stored = uni.getStorageSync('user_info');
        if (!stored) return;
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        this.userInfo = {
          ...this.userInfo,
          name: parsed.username || this.userInfo.name,
          city: parsed.city_name || this.userInfo.city,
          department: parsed.department || this.userInfo.department,
          role: parsed.is_admin ? '系统管理员' : this.userInfo.role
        };
        this._isAdmin = !!parsed.is_admin;
      } catch (e) {
        console.error('解析存储的用户信息失败:', e);
      }
    },
    // 为管理员注入“管理面板”入口
    injectAdminEntry() {
      if (!this._isAdmin) return;
      const adminSectionTitle = '管理';
      const adminItemTitle = '管理面板';
      const adminPath = '/pages-admin/admin-index/admin-index';
      
      // 检查是否已存在管理入口，避免重复添加
      const exists = this.menuSections.some(section =>
        section.items && section.items.some(item => item.title === adminItemTitle)
      );
      if (exists) return;
      
      this.menuSections.unshift({
        title: adminSectionTitle,
        items: [
          {
            icon: '🛠',
            iconClass: 'purple',
            title: adminItemTitle,
            desc: '进入后台管理面板',
            path: adminPath
          }
        ]
      });
    },
    
    handleMenuClick(item) {
      console.log('点击菜单:', item.title);
      if (item.path) {
        uni.navigateTo({
          url: item.path
        });
      } else {
        uni.showToast({
          title: `${item.title}（开发中）`,
          icon: 'none'
        });
      }
    },
    
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('auth_token');
            uni.removeStorageSync('user_info');
            
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
            
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/login'
              });
            }, 1500);
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background-color: #F8F8F8;
}

/* 头部用户信息区 */
.profile-header {
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  padding: 48rpx 40rpx 80rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.avatar-container {
  position: relative;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, #FC4C02, #FFA300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64rpx;
  color: #FFFFFF;
}

.avatar-badge {
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.user-role {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.user-department {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  gap: 12rpx;
}

/* 统计卡片 */
.stats-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  margin: -40rpx 32rpx 0;
  box-shadow: 0px 8rpx 24rpx rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-around;
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2rpx;
  height: 64rpx;
  background-color: #EEEEEE;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #4C12A1;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

/* 内容区域 */
.content {
  padding: 40rpx 32rpx;
}

/* 菜单分组 */
.menu-section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #999999;
  padding: 0 8rpx 16rpx;
}

.menu-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0px 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 0px 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #F5F5F5;
  transition: background-color 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background-color: #F8F8F8;
}

.menu-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.menu-icon.purple {
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.1), rgba(201, 100, 207, 0.1));
}

.menu-icon.orange {
  background: linear-gradient(135deg, rgba(252, 76, 2, 0.1), rgba(255, 163, 0, 0.1));
}

.menu-icon.blue {
  background: linear-gradient(135deg, rgba(45, 204, 211, 0.1), rgba(33, 150, 243, 0.1));
}

.menu-icon.pink {
  background: linear-gradient(135deg, rgba(239, 74, 129, 0.1), rgba(233, 30, 99, 0.1));
}

.menu-icon.green {
  background: linear-gradient(135deg, rgba(67, 160, 71, 0.1), rgba(56, 142, 60, 0.1));
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.menu-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

.menu-desc {
  font-size: 24rpx;
  color: #999999;
}

.menu-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
  flex-shrink: 0;
}

.menu-badge {
  background-color: #FF4444;
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  margin-left: 16rpx;
}

/* 退出按钮 */
.logout-btn {
  margin-top: 40rpx;
  padding: 32rpx;
  background-color: #FFFFFF;
  border: none;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #FF4444;
  box-shadow: 0px 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 0px 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  transition: all 0.2s;
}

.logout-btn:active {
  transform: scale(0.98);
  opacity: 0.8;
}
</style>
