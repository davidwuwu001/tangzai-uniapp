<template>
  <view class="service-page">
    <!-- 顶部标签切换 -->
    <view class="tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value" 
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 卡片列表 -->
    <view class="card-list">
      <!-- 加载中 -->
      <view v-if="loading" class="loading-wrapper">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="currentCards.length === 0" class="empty-wrapper">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无服务</text>
      </view>

      <!-- 卡片 -->
      <view v-else class="cards">
        <view 
          v-for="card in currentCards" 
          :key="card.id" 
          class="card-item"
          @click="handleCardClick(card)"
        >
          <view class="card-icon">{{ card.icon || '🔗' }}</view>
          <view class="card-content">
            <view class="card-title">{{ card.title }}</view>
            <view class="card-desc">{{ card.description }}</view>
            <view v-if="card.department" class="card-tag">{{ card.department }}</view>
          </view>
          <view class="card-arrow">›</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getWebCards, getFeishuCards } from '@/api/cards'
import { cachedRequest } from '@/utils/cache'
export default {
  data() {
    return {
      activeTab: 'web', // 当前选中的标签
      loading: false,
      tabs: [
        { label: '网页服务', value: 'web' },
        { label: '飞书数据', value: 'feishu' }
      ],
      webCards: [], // 网页服务卡片
      feishuCards: [], // 飞书数据卡片
      useRealAPI: true,
      page: { web: 1, feishu: 1 },
      pageSize: 10,
      hasMore: { web: true, feishu: true },
      filters: { city: '', department: '' }
    }
  },
  
  computed: {
    // 当前显示的卡片
    currentCards() {
      return this.activeTab === 'web' ? this.webCards : this.feishuCards
    }
  },
  
  onLoad() {
    this.initFilters()
    this.loadCards(true)
  },
  
  onPullDownRefresh() {
    this.refreshCards()
  },
  onReachBottom() {
    this.loadMore()
  },
  
  methods: {
    /**
     * 初始化权限过滤
     */
    initFilters() {
      try {
        const userStr = uni.getStorageSync('user_info')
        if (userStr) {
          const user = JSON.parse(userStr)
          this.filters.city = user.city || ''
          this.filters.department = user.department || ''
        }
      } catch (e) {}
    },
    // 切换标签
    switchTab(value) {
      this.activeTab = value
      console.log('切换到:', value)
      // 标签切换时如无数据则加载
      if ((value === 'web' && this.webCards.length === 0) || (value === 'feishu' && this.feishuCards.length === 0)) {
        this.loadCards()
      }
    },
    
    /**
     * 加载当前标签的卡片（支持分页）
     * @param {Boolean} reset 是否重置分页
     */
    async loadCards(reset = false) {
      this.loading = true
      try {
        if (reset) {
          this.page = { web: 1, feishu: 1 }
          this.hasMore = { web: true, feishu: true }
          this.webCards = []
          this.feishuCards = []
        }

        if (this.useRealAPI) {
          const isWeb = this.activeTab === 'web'
          const key = isWeb ? 'web_cards_page_1' : 'feishu_cards_page_1'
          const params = {
            page: this.page[isWeb ? 'web' : 'feishu'],
            pageSize: this.pageSize,
            city: this.filters.city,
            department: this.filters.department
          }
          let resp
          if (params.page === 1) {
            resp = await cachedRequest(key, () => (isWeb ? getWebCards(params) : getFeishuCards(params)), false)
          } else {
            resp = isWeb ? await getWebCards(params) : await getFeishuCards(params)
          }
          const list = (resp && resp.data) ? resp.data : (Array.isArray(resp) ? resp : [])
          if (Array.isArray(list)) {
            if (isWeb) {
              this.webCards = this.webCards.concat(list)
              this.hasMore.web = list.length >= this.pageSize
              if (this.hasMore.web) this.page.web += 1
            } else {
              this.feishuCards = this.feishuCards.concat(list)
              this.hasMore.feishu = list.length >= this.pageSize
              if (this.hasMore.feishu) this.page.feishu += 1
            }
          }
          console.log('服务卡片加载成功')
        } else {
          await this.simulateDelay(1000)
          // 保留原模拟数据作为兜底
          const mockWeb = [
            { id: 1, title: '教务系统', description: '查看课表、成绩、考试安排', icon: '📚', department: '教务处' },
            { id: 2, title: '图书馆', description: '图书检索、借阅记录查询', icon: '📖', department: '图书馆' },
            { id: 3, title: '校园卡服务', description: '余额查询、消费记录、挂失', icon: '💳', department: '后勤处' }
          ]
          const mockFeishu = [
            { id: 101, title: '教学计划', description: '本学期教学计划和课程安排', icon: '📋', department: '教务处' },
            { id: 102, title: '考勤统计', description: '学生出勤情况统计', icon: '📊', department: '教务处' },
            { id: 103, title: '通知公告', description: '学校最新通知和公告', icon: '📢', department: '办公室' }
          ]
          this.webCards = reset ? mockWeb : this.webCards.concat(mockWeb)
          this.feishuCards = reset ? mockFeishu : this.feishuCards.concat(mockFeishu)
          this.hasMore = { web: false, feishu: false }
        }
      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 刷新当前标签数据
     */
    async refreshCards() {
      try {
        await this.loadCards(true)
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        })
      } finally {
        uni.stopPullDownRefresh()
      }
    },
    
    /**
     * 加载更多（上拉）
     */
    async loadMore() {
      const isWeb = this.activeTab === 'web'
      if (!(isWeb ? this.hasMore.web : this.hasMore.feishu)) return
      await this.loadCards(false)
    },
    
    /**
     * 卡片点击事件
     * @param {Object} card 卡片对象
     */
    handleCardClick(card) {
      console.log('点击卡片:', card)
      if (this.activeTab === 'web') {
        // TODO: Day 9 打开网页
        uni.showToast({
          title: `即将打开 ${card.title}`,
          icon: 'none'
        })
      } else {
        // TODO: Day 10 显示飞书数据详情
        uni.showToast({
          title: `查看 ${card.title}`,
          icon: 'none'
        })
      }
    },
    
    /**
     * 开发用延迟
     * @param {Number} ms 毫秒
     */
    simulateDelay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.service-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100rpx;
}

/* 标签切换 */
.tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  transition: all 0.3s;
}

.tab-item.active {
  color: #667eea;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #667eea;
  border-radius: 2rpx;
}

/* 卡片列表 */
.card-list {
  padding: 20rpx 30rpx;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text {
  color: #999;
  font-size: 28rpx;
}

.empty-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.card-item:active {
  transform: scale(0.98);
  opacity: 0.8;
}

.card-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
  margin-bottom: 10rpx;
}

.card-tag {
  display: inline-block;
  font-size: 22rpx;
  color: #667eea;
  background: #f0f2ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.card-arrow {
  font-size: 50rpx;
  color: #ddd;
  font-weight: 300;
}
</style>
