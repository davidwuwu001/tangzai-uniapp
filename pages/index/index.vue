<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-top">
        <view class="navbar-time">{{ currentTime }}</view>
        <view class="navbar-actions">
          <view class="nav-icon bell" @click="handleNotification"></view>
          <view class="nav-icon settings" @click="handleSettings"></view>
        </view>
      </view>
      <view class="navbar-title">汤仔助手</view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <!-- 最新通知轮播 -->
      <view class="section">
        <view class="section-title">最新通知</view>
        <view class="notice-carousel">
          <swiper 
            class="notice-swiper" 
            :indicator-dots="true" 
            :autoplay="true" 
            :interval="3000"
            :circular="true"
            indicator-color="rgba(0,0,0,0.2)"
            indicator-active-color="#FC4C02"
          >
            <swiper-item v-for="(notice, index) in notices" :key="index">
              <view class="notice-slide" @click="handleNoticeClick(notice)">
                <view class="notice-slide-content">
                  <view :class="['notice-icon', notice.type]">
                    <text>{{ notice.icon }}</text>
                  </view>
                  <view class="notice-text">
                    <view class="notice-title">{{ notice.title }}</view>
                    <view class="notice-meta">
                      <text :class="['notice-tag', notice.type]">{{ notice.tag }}</text>
                      <text>{{ notice.time }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </swiper-item>
          </swiper>
        </view>
      </view>

      <!-- 今日待办 -->
      <view class="section">
        <view class="section-title">今日待办</view>
        <view class="todo-card">
          <view class="todo-item" v-for="(todo, index) in todos" :key="index" @click="handleTodoClick(todo)">
            <view :class="['todo-time', todo.color]">{{ todo.time }}</view>
            <view class="todo-content">{{ todo.content }}</view>
            <view :class="['todo-status', todo.status]">
              <view class="status-icon clock"></view>
              <text>{{ todo.statusText }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷入口 -->
      <view class="section">
        <view class="section-title">快捷入口</view>
        <view class="quick-grid">
          <view 
            class="quick-item" 
            v-for="(item, index) in quickEntries" 
            :key="index"
            @click="handleQuickEntry(item)"
          >
            <view :class="['quick-icon-wrapper', item.type]">
              <view class="quick-icon" :style="{ backgroundImage: `url(${item.icon})` }"></view>
            </view>
            <view class="quick-label">{{ item.label }}</view>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view style="height: 120rpx;"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTime: '',
      // 最新通知数据
      notices: [
        {
          icon: '📝',
          type: 'teaching',
          title: '关于新版教师评估标准的通知',
          tag: '教学部',
          time: '今天 09:30'
        },
        {
          icon: '🎉',
          type: 'activity',
          title: '周末亲子活动安排',
          tag: '活动组',
          time: '昨天 16:45'
        },
        {
          icon: '🛠',
          type: 'tech',
          title: '系统升级公告',
          tag: '技术部',
          time: '前天 14:20'
        },
        {
          icon: '🎯',
          type: 'training',
          title: '教师培训计划',
          tag: '培训组',
          time: '3天前'
        }
      ],
      // 今日待办数据
      todos: [
        {
          time: '14:30',
          color: 'purple',
          content: '王小明家长咨询',
          status: 'upcoming',
          statusText: '即将开始'
        },
        {
          time: '17:00',
          color: 'orange',
          content: '张丽训练打卡提醒',
          status: 'pending',
          statusText: '未完成'
        },
        {
          time: '10:00',
          color: 'cyan',
          content: '李华能力评估报告',
          status: 'completed',
          statusText: '已完成'
        }
      ],
      // 快捷入口数据
      quickEntries: [
        {
          type: 'ai',
          icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3ef754-660cdc92-be6e-47e6-ba55-2fcbbedb55d3.svg',
          label: 'AI智能体',
          path: '/pages/ai/ai'
        },
        {
          type: 'calendar',
          icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3e9b03-b9ca2e11-7c17-43bf-a7c5-381ca24a003b.svg',
          label: '咨询安排',
          path: '/pages/consultation/consultation'
        },
        {
          type: 'checkin',
          icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3e243a-15e48f1a-2e7e-4bcd-91f3-f408e17fc9a4.svg',
          label: '服务打卡',
          path: '/pages/checkin/checkin'
        },
        {
          type: 'input',
          icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3ecfce-c82d2609-3a3d-423a-9901-1ba8c46424e2.svg',
          label: '信息录入',
          path: '/pages/input/input'
        },
        {
          type: 'learning',
          icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3ea131-04a1b31f-b7b3-43df-9360-32cd6a8dd3e9.svg',
          label: '学习资料',
          path: '/pages/learning/learning'
        },
        {
          type: 'all',
          icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3e93cc-1f77fdd3-b13d-491d-ae2b-97c1d642c811.svg',
          label: '全部功能',
          path: '/pages/all/all'
        }
      ]
    }
  },
  
  onLoad() {
    this.updateTime()
    // 每分钟更新一次时间
    setInterval(() => {
      this.updateTime()
    }, 60000)
  },
  
  methods: {
    // 更新时间
    updateTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      this.currentTime = `${hours}:${minutes}`
    },
    
    // 处理通知点击
    handleNotification() {
      uni.showToast({
        title: '查看通知',
        icon: 'none'
      })
    },
    
    // 处理设置点击
    handleSettings() {
      uni.showToast({
        title: '打开设置',
        icon: 'none'
      })
    },
    
    // 处理通知卡片点击
    handleNoticeClick(notice) {
      uni.showToast({
        title: notice.title,
        icon: 'none'
      })
    },
    
    // 处理待办点击
    handleTodoClick(todo) {
      uni.showToast({
        title: todo.content,
        icon: 'none'
      })
    },
    
    // 处理快捷入口点击
    handleQuickEntry(item) {
      uni.showToast({
        title: `${item.label}功能开发中`,
        icon: 'none'
      })
      // TODO: 导航到对应页面
      // uni.navigateTo({ url: item.path })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #FFFFFF;
}

/* 顶部导航栏 */
.navbar {
  background: #4C12A1;
  padding: 24rpx 40rpx 28rpx;
  color: white;
}

.navbar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.navbar-time {
  font-size: 28rpx;
  font-weight: 500;
  line-height: 40rpx;
}

.navbar-actions {
  display: flex;
  gap: 16rpx;
  padding: 4rpx 0;
}

.nav-icon {
  width: 32rpx;
  height: 32rpx;
  background-size: cover;
  background-repeat: no-repeat;
  transition: transform 0.2s;
}

.nav-icon:active {
  transform: scale(0.9);
}

.nav-icon.bell {
  background-image: url('https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3eb893-66d1cd6f-aa32-4b2f-852a-b65a7ccaf312.svg');
}

.nav-icon.settings {
  background-image: url('https://miaoduo.fbcontent.cn/private/resource/image/19a24b5abdbb9f9-bddf6e6c-a37c-409e-aa2c-35134cd0932b.svg');
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 56rpx;
  padding: 28rpx 0;
}

/* 内容区域 */
.content {
  height: calc(100vh - 200rpx);
  padding: 0 32rpx 32rpx;
  background: #FFFFFF;
}

/* 区块标题 */
.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  line-height: 48rpx;
  margin-bottom: 32rpx;
  margin-top: 0;
  padding-top: 32rpx;
}

/* 最新通知轮播 */
.notice-carousel {
  border-radius: 24rpx;
  background: linear-gradient(135deg, #FFF9F0, #FFF5E6);
  overflow: hidden;
  margin-bottom: 32rpx;
}

.notice-swiper {
  height: 180rpx;
}

.notice-slide {
  height: 100%;
  padding: 32rpx 40rpx;
}

.notice-slide:active {
  opacity: 0.8;
}

.notice-slide-content {
  display: flex;
  align-items: center;
  gap: 24rpx;
  height: 100%;
}

.notice-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.notice-icon.teaching {
  background: rgba(76, 18, 161, 0.15);
}

.notice-icon.activity {
  background: rgba(255, 163, 0, 0.15);
}

.notice-icon.tech {
  background: rgba(45, 204, 211, 0.15);
}

.notice-icon.training {
  background: rgba(239, 74, 129, 0.15);
}

.notice-text {
  flex: 1;
  min-width: 0;
}

.notice-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 24rpx;
  color: #999999;
}

.notice-tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  line-height: 28rpx;
}

.notice-tag.teaching {
  background: rgba(76, 18, 161, 0.12);
  color: #4C12A1;
}

.notice-tag.activity {
  background: rgba(255, 163, 0, 0.12);
  color: #FFA300;
}

.notice-tag.tech {
  background: rgba(45, 204, 211, 0.12);
  color: #2DCCD3;
}

.notice-tag.training {
  background: rgba(239, 74, 129, 0.12);
  color: #EF4A81;
}

/* 今日待办 */
.todo-card {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0rpx 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 0rpx 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  margin-bottom: 32rpx;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.todo-item:first-child {
  padding-top: 0;
}

.todo-item:active {
  opacity: 0.8;
}

.todo-time {
  flex-shrink: 0;
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: white;
}

.todo-time.purple {
  background: #C964CF;
}

.todo-time.orange {
  background: #FC4C02;
}

.todo-time.cyan {
  background: #2DCCD3;
}

.todo-content {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  line-height: 40rpx;
  margin-top: 8rpx;
}

.todo-status {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
}

.todo-status.upcoming {
  background: #FFF3E0;
  color: #F57C00;
}

.todo-status.pending {
  background: #FFEBEE;
  color: #E53935;
}

.todo-status.completed {
  background: #E8F5E9;
  color: #43A047;
}

.status-icon {
  width: 32rpx;
  height: 32rpx;
  background-size: cover;
  background-repeat: no-repeat;
}

.status-icon.clock {
  background-image: url('https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3e1ee8-b1c5238c-4b6e-4383-b850-f0931859ef42.svg');
}

/* 快捷入口 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  transition: transform 0.2s;
}

.quick-item:active {
  transform: scale(0.95);
}

.quick-icon-wrapper {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.quick-icon {
  width: 48rpx;
  height: 48rpx;
  background-size: cover;
  background-repeat: no-repeat;
}

.quick-icon-wrapper.ai {
  background: rgba(252, 76, 2, 0.12);
}

.quick-icon-wrapper.calendar {
  background: rgba(255, 163, 0, 0.12);
}

.quick-icon-wrapper.checkin {
  background: rgba(239, 74, 129, 0.12);
}

.quick-icon-wrapper.input {
  background: rgba(45, 204, 211, 0.12);
}

.quick-icon-wrapper.learning {
  background: rgba(201, 100, 207, 0.12);
}

.quick-icon-wrapper.all {
  background: rgba(76, 18, 161, 0.12);
}

.quick-label {
  font-size: 24rpx;
  color: #333;
  line-height: 32rpx;
}
</style>
