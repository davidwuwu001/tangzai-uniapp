<template>
  <view class="mine-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-avatar">
        <image v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill"></image>
        <text v-else class="avatar-placeholder">👤</text>
      </view>
      <view class="user-info">
        <view class="user-name">{{ userInfo.name || '未登录' }}</view>
        <view class="user-role">{{ userInfo.role || '点击登录' }}</view>
      </view>
      <view class="user-arrow">›</view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-section">
      <view class="section-title">常用功能</view>
      <view class="menu-list">
        <view 
          v-for="item in menuItems" 
          :key="item.id" 
          class="menu-item"
          @click="handleMenuClick(item)"
        >
          <view class="menu-icon">{{ item.icon }}</view>
          <view class="menu-label">{{ item.label }}</view>
          <view class="menu-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 设置列表 -->
    <view class="menu-section">
      <view class="section-title">设置</view>
      <view class="menu-list">
        <view 
          v-for="item in settingItems" 
          :key="item.id" 
          class="menu-item"
          @click="handleSettingClick(item)"
        >
          <view class="menu-icon">{{ item.icon }}</view>
          <view class="menu-label">{{ item.label }}</view>
          <view class="menu-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>汤仔助手 v1.0.0</text>
    </view>
  </view>
</template>

<script>
import { logout as logoutAPI } from '@/api/auth'

export default {
  data() {
    return {
      userInfo: {}, // 用户信息
      menuItems: [
        { id: 1, label: '我的收藏', icon: '⭐' },
        { id: 2, label: '历史记录', icon: '🕒' },
        { id: 3, label: '预约记录', icon: '📅' },
        { id: 4, label: '帮助中心', icon: '❓' }
      ],
      settingItems: [
        { id: 5, label: '账号设置', icon: '⚙️' },
        { id: 6, label: '通知设置', icon: '🔔' },
        { id: 7, label: '隐私设置', icon: '🔒' },
        { id: 8, label: '关于我们', icon: 'ℹ️' }
      ]
    }
  },
  
  onLoad() {
    this.loadUserInfo()
  },
  
  onShow() {
    // 每次显示页面时刷新用户信息
    this.loadUserInfo()
  },
  
  methods: {
    // 加载用户信息
    loadUserInfo() {
      try {
        const userInfoStr = uni.getStorageSync('user_info')
        if (userInfoStr) {
          this.userInfo = JSON.parse(userInfoStr)
          console.log('用户信息:', this.userInfo)
        } else {
          console.log('未找到用户信息')
          this.userInfo = {}
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        this.userInfo = {}
      }
    },
    
    // 点击菜单项
    handleMenuClick(item) {
      console.log('点击菜单:', item.label)
      
      switch(item.id) {
        case 1: // 我的收藏
          uni.showToast({ title: '我的收藏（开发中）', icon: 'none' })
          break
        case 2: // 历史记录
          uni.showToast({ title: '历史记录（开发中）', icon: 'none' })
          break
        case 3: // 预约记录
          uni.showToast({ title: '预约记录（开发中）', icon: 'none' })
          break
        case 4: // 帮助中心
          uni.showToast({ title: '帮助中心（开发中）', icon: 'none' })
          break
      }
    },
    
    // 点击设置项
    handleSettingClick(item) {
      console.log('点击设置:', item.label)
      
      switch(item.id) {
        case 5: // 账号设置
          uni.showToast({ title: '账号设置（开发中）', icon: 'none' })
          break
        case 6: // 通知设置
          uni.showToast({ title: '通知设置（开发中）', icon: 'none' })
          break
        case 7: // 隐私设置
          uni.showToast({ title: '隐私设置（开发中）', icon: 'none' })
          break
        case 8: // 关于我们
          this.showAbout()
          break
      }
    },
    
    // 显示关于我们
    showAbout() {
      uni.showModal({
        title: '关于汤仔助手',
        content: '汤仔助手是一款智能教研服务平台\n\n版本: v1.0.0\n开发者: 汤仔团队',
        showCancel: false,
        confirmText: '知道了'
      })
    },
    
    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用退出登录API
              // await logoutAPI()
              
              // 清除本地存储
              uni.removeStorageSync('auth_token')
              uni.removeStorageSync('user_info')
              
              console.log('已退出登录')
              
              // 显示提示
              uni.showToast({
                title: '已退出登录',
                icon: 'success'
              })
              
              // 跳转到登录页
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/login/login'
                })
              }, 1500)
              
            } catch (error) {
              console.error('退出登录失败:', error)
              uni.showToast({
                title: '退出失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100rpx;
}

/* 用户信息卡片 */
.user-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  overflow: hidden;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  font-size: 60rpx;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10rpx;
}

.user-role {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.user-arrow {
  font-size: 50rpx;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
}

/* 菜单区域 */
.menu-section {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #999;
  padding: 20rpx 30rpx 10rpx;
}

.menu-list {
  background: #fff;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f8f8f8;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  width: 50rpx;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 40rpx;
  color: #ddd;
  font-weight: 300;
}

/* 退出登录 */
.logout-section {
  padding: 30rpx;
}

.logout-btn {
  width: 100%;
  background: #fff;
  color: #ff4d4f;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  padding: 28rpx 0;
  box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.1);
}

.logout-btn:active {
  opacity: 0.8;
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
}
</style>
