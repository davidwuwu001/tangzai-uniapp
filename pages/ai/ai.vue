<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view style="width: 40rpx;"></view>
      <view class="navbar-title">AI智能体</view>
      <view class="navbar-icon icon-search" @click="handleSearch"></view>
    </view>
    
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          type="text" 
          v-model="searchKeyword"
          placeholder="搜索智能体..."
          @confirm="handleSearchConfirm"
        />
      </view>
    </view>
    
    <!-- 常用智能体 -->
    <view class="favorite-section">
      <view class="section-title">⭐ 常用智能体</view>
      <scroll-view class="favorite-scroll" scroll-x>
        <view 
          class="favorite-item" 
          v-for="(item, index) in favoriteAgents" 
          :key="index"
          @click="handleAgentClick(item)"
        >
          <view :class="['favorite-icon', item.type]">
            <text>{{ item.icon }}</text>
          </view>
          <view class="favorite-name">{{ item.name }}</view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 分类标签 -->
    <view class="category-section">
      <scroll-view class="tabs-scroll" scroll-x>
        <view 
          :class="['tab-item', activeCategory === item.value ? 'active' : '']"
          v-for="(item, index) in categories" 
          :key="index"
          @click="handleCategoryChange(item.value)"
        >
          {{ item.label }}
        </view>
      </scroll-view>
    </view>
    
    <!-- AI智能体网格 -->
    <scroll-view class="content" scroll-y>
      <view class="ai-grid">
        <view 
          class="ai-card" 
          v-for="(agent, index) in filteredAgents" 
          :key="index"
          @click="handleAgentClick(agent)"
        >
          <view :class="['ai-icon', agent.type]">
            <text>{{ agent.icon }}</text>
          </view>
          <view class="ai-name">{{ agent.name }}</view>
          <view class="ai-desc">{{ agent.desc }}</view>
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
      searchKeyword: '',
      activeCategory: 'all',
      // 常用智能体
      favoriteAgents: [
        { icon: '👩‍🏫', name: '教学助手', type: 'teaching' },
        { icon: '✍️', name: '写作助手', type: 'writing' },
        { icon: '🗣️', name: '英语对话', type: 'english' },
        { icon: '📚', name: '课程规划', type: 'teaching' }
      ],
      // 分类标签
      categories: [
        { label: '全部', value: 'all' },
        { label: '教学', value: 'teaching' },
        { label: '写作', value: 'writing' },
        { label: '编程', value: 'coding' },
        { label: '数学', value: 'math' },
        { label: '英语', value: 'english' },
        { label: '物理', value: 'physics' }
      ],
      // 所有智能体
      allAgents: [
        { icon: '👩‍🏫', name: '教学助手', desc: '辅助备课与教学', type: 'teaching' },
        { icon: '✍️', name: '写作助手', desc: '文章润色与指导', type: 'writing' },
        { icon: '🗣️', name: '英语对话', desc: '口语练习伙伴', type: 'english' },
        { icon: '🔬', name: '物理实验', desc: '实验设计与分析', type: 'physics' },
        { icon: '💻', name: '编程导师', desc: '代码学习辅导', type: 'coding' },
        { icon: '📐', name: '数学解题', desc: '解题思路讲解', type: 'math' },
        { icon: '📚', name: '课程规划', desc: '教学计划制定', type: 'teaching' },
        { icon: '📝', name: '论文助手', desc: '学术写作辅导', type: 'writing' }
      ]
    }
  },
  
  computed: {
    // 根据分类过滤智能体
    filteredAgents() {
      if (this.activeCategory === 'all') {
        return this.allAgents
      }
      return this.allAgents.filter(agent => agent.type === this.activeCategory)
    }
  },
  
  methods: {
    // 处理搜索图标点击
    handleSearch() {
      uni.showToast({
        title: '搜索功能',
        icon: 'none'
      })
    },
    
    // 处理搜索确认
    handleSearchConfirm() {
      if (this.searchKeyword) {
        uni.showToast({
          title: `搜索: ${this.searchKeyword}`,
          icon: 'none'
        })
      }
    },
    
    // 处理分类切换
    handleCategoryChange(category) {
      this.activeCategory = category
    },
    
    // 处理智能体点击
    handleAgentClick(agent) {
      uni.showToast({
        title: `打开 ${agent.name}`,
        icon: 'none'
      })
      // TODO: 导航到智能体详情或聊天页面
      // uni.navigateTo({ url: `/pages/chat/chat?agentId=${agent.id}` })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #F8F8F8;
}

/* 顶部导航栏 */
.navbar {
  background: #4C12A1;
  padding: 24rpx 40rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: white;
  flex: 1;
  text-align: center;
}

.navbar-icon {
  width: 40rpx;
  height: 40rpx;
  background-size: cover;
  filter: brightness(0) invert(1);
}

.icon-search {
  background-image: url('https://miaoduo.fbcontent.cn/private/resource/image/19a24b5abdbb9f9-0de8e43a-33e2-4c51-9e96-a24ce48e5a1c.svg');
}

/* 搜索栏 */
.search-section {
  padding: 32rpx 40rpx;
  background: white;
}

.search-box {
  display: flex;
  align-items: center;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  color: #999;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

/* 常用智能体 */
.favorite-section {
  padding: 40rpx 40rpx 32rpx;
  background: white;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 32rpx;
}

.favorite-scroll {
  white-space: nowrap;
}

.favorite-item {
  display: inline-block;
  min-width: 200rpx;
  background: white;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  box-shadow: 0rpx 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 0rpx 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  margin-right: 24rpx;
  transition: transform 0.2s;
  vertical-align: top;
}

.favorite-item:active {
  transform: scale(0.95);
}

.favorite-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin: 0 auto 20rpx;
}

.favorite-icon.teaching {
  background: rgba(76, 18, 161, 0.15);
}

.favorite-icon.writing {
  background: rgba(255, 163, 0, 0.15);
}

.favorite-icon.english {
  background: rgba(45, 204, 211, 0.15);
}

.favorite-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
  white-space: nowrap;
}

/* 分类标签 */
.category-section {
  padding: 32rpx 40rpx;
  background: white;
  margin-bottom: 24rpx;
}

.tabs-scroll {
  white-space: nowrap;
}

.tab-item {
  display: inline-block;
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  background: #F5F5F5;
  color: #666666;
  font-size: 26rpx;
  margin-right: 16rpx;
  transition: all 0.3s;
  border: 2rpx solid transparent;
}

.tab-item.active {
  background: rgba(76, 18, 161, 0.12);
  color: #4C12A1;
  font-weight: 500;
  border-color: #4C12A1;
}

/* 内容区域 */
.content {
  height: calc(100vh - 500rpx);
}

/* AI智能体网格 */
.ai-grid {
  padding: 0 40rpx 40rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.ai-card {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  text-align: center;
  box-shadow: 0rpx 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 0rpx 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  transition: transform 0.2s;
}

.ai-card:active {
  transform: scale(0.98);
}

.ai-icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  margin: 0 auto 24rpx;
}

.ai-icon.teaching {
  background: rgba(76, 18, 161, 0.15);
}

.ai-icon.writing {
  background: rgba(255, 163, 0, 0.15);
}

.ai-icon.english {
  background: rgba(45, 204, 211, 0.15);
}

.ai-icon.physics {
  background: rgba(252, 76, 2, 0.15);
}

.ai-icon.coding {
  background: rgba(239, 74, 129, 0.15);
}

.ai-icon.math {
  background: rgba(201, 100, 207, 0.15);
}

.ai-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.ai-desc {
  font-size: 24rpx;
  color: #999999;
  line-height: 32rpx;
}
</style>
