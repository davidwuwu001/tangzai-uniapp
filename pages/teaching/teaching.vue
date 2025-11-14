<template>
  <view class="teaching-page">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="icon">🔍</text>
        <input 
          type="text" 
          placeholder="搜索教研助手..." 
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
      </view>
    </view>

    <!-- 卡片列表 -->
    <view class="card-list">
      <!-- 加载中 -->
      <view v-if="loading" class="loading-wrapper">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="cards.length === 0" class="empty-wrapper">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无教研助手</text>
      </view>

      <!-- 卡片列表 -->
      <view v-else class="cards">
        <view 
          v-for="card in filteredCards" 
          :key="card.id" 
          class="card-item"
          @click="handleCardClick(card)"
        >
          <view class="card-icon">{{ card.icon || '🤖' }}</view>
          <view class="card-content">
            <view class="card-title">{{ card.title }}</view>
            <view class="card-desc">{{ card.description }}</view>
          </view>
          <view class="card-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 下拉刷新提示 -->
    <view v-if="refreshing" class="refresh-hint">
      <text>刷新中...</text>
    </view>
  </view>
</template>

<script>
import { getAgents } from '@/api/cards'
import { cachedRequest } from '@/utils/cache'

export default {
  data() {
    return {
      searchKeyword: '', // 搜索关键词
      loading: false, // 加载状态
      refreshing: false, // 刷新状态
      cards: [], // 卡片数据
      useRealAPI: true, // 是否使用真实API
      page: 1, // 当前页码
      pageSize: 10, // 每页数量
      hasMore: true, // 是否有更多
      filters: { city: '', department: '' } // 权限过滤参数
    }
  },
  
  computed: {
    // 过滤后的卡片列表
    filteredCards() {
      if (!this.searchKeyword) {
        return this.cards
      }
      const keyword = this.searchKeyword.toLowerCase()
      return this.cards.filter(card => 
        card.title.toLowerCase().includes(keyword) || 
        card.description.toLowerCase().includes(keyword)
      )
    }
  },
  
  onLoad() {
    // 页面加载时获取数据
    this.initFilters()
    this.loadCards(true)
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.refreshCards()
  },
  
  methods: {
    /**
     * 初始化权限过滤参数
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
    
    /**
     * 加载卡片数据（支持分页）
     * @param {Boolean} reset 是否重置分页
     */
    async loadCards(reset = false) {
      this.loading = true
      try {
        if (reset) {
          this.page = 1
          this.hasMore = true
          this.cards = []
        }

        if (this.useRealAPI) {
          // 首页使用缓存，其余页直接请求
          let resp
          const params = {
            page: this.page,
            pageSize: this.pageSize,
            search: this.searchKeyword || '',
            city: this.filters.city,
            department: this.filters.department
          }
          if (this.page === 1) {
            resp = await cachedRequest(
              'agents_list_page_1',
              () => getAgents(params),
              false
            )
          } else {
            resp = await getAgents(params)
          }

          const list = (resp && resp.data) ? resp.data : (Array.isArray(resp) ? resp : [])
          if (Array.isArray(list)) {
            this.cards = this.cards.concat(list)
            // 是否还有更多（后端可返回 total 或根据返回条目判断）
            this.hasMore = list.length >= this.pageSize
            if (this.hasMore) {
              this.page += 1
            }
          }
          console.log('从后端加载卡片数据:', this.cards)
        } else {
          // 使用模拟数据
          await this.simulateDelay(1000)
          const mock = [
            {
              id: 1,
              title: '数学教学助手',
              description: '帮助解答数学问题，提供教学方案',
              icon: '📐'
            },
            {
              id: 2,
              title: '语文作文助手',
              description: '作文批改、写作指导、素材推荐',
              icon: '✍️'
            },
            {
              id: 3,
              title: '英语口语助手',
              description: '英语对话练习、发音纠正',
              icon: '🗣️'
            },
            {
              id: 4,
              title: '物理实验助手',
              description: '物理实验指导、原理讲解',
              icon: '🔬'
            }
          ]
          this.cards = reset ? mock : this.cards.concat(mock)
          this.hasMore = false
          console.log('模拟数据加载成功:', this.cards)
        }
      } catch (error) {
        console.error('加载卡片失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 刷新卡片数据（重置分页并忽略缓存）
     */
    async refreshCards() {
      this.refreshing = true
      try {
        await this.loadCards(true)
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('刷新失败:', error)
      } finally {
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },
    
    /**
     * 处理搜索（重置分页并重新加载）
     */
    handleSearch() {
      console.log('搜索关键词:', this.searchKeyword)
      this.loadCards(true)
    },
    
    /**
     * 卡片点击事件
     * @param {Object} card 卡片对象
     */
    handleCardClick(card) {
      console.log('点击卡片:', card)
      // TODO: Day 8 跳转到AI对话页面
      uni.showToast({
        title: `点击了 ${card.title}`,
        icon: 'none'
      })
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
.teaching-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100rpx;
}

/* 搜索栏 */
.search-bar {
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.search-input {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
}

.search-input .icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.search-input input {
  flex: 1;
  font-size: 28rpx;
}

/* 卡片列表 */
.card-list {
  padding: 20rpx 30rpx;
}

/* 加载中 */
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

/* 空状态 */
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

/* 卡片 */
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
}

.card-arrow {
  font-size: 50rpx;
  color: #ddd;
  font-weight: 300;
}

/* 刷新提示 */
.refresh-hint {
  position: fixed;
  top: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  font-size: 26rpx;
  z-index: 999;
}
</style>
