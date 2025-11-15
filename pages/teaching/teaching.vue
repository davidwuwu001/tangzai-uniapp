<template>
  <view class="agent-list-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="navbar-content">
        <text class="navbar-title">智能体</text>
        <view class="navbar-actions">
          <text class="navbar-icon">🔍</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索智能体" 
          placeholder-style="color: #999999"
          v-model="searchKeyword"
        />
      </view>
    </view>

    <!-- 常用智能体 -->
    <view class="favorite-section">
      <view class="section-header">
        <text class="section-title">⭐ 常用智能体</text>
      </view>
      <scroll-view class="favorite-scroll" scroll-x show-scrollbar="false">
        <view 
          v-for="agent in favoriteAgents" 
          :key="agent.id" 
          class="favorite-card"
          @click="openAgent(agent)"
        >
          <view class="favorite-icon-wrapper" :style="{ backgroundColor: agent.iconBg }">
            <text class="favorite-icon">{{ agent.icon }}</text>
          </view>
          <text class="favorite-name">{{ agent.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 分类标签 -->
    <view class="category-section">
      <scroll-view class="category-scroll" scroll-x show-scrollbar="false">
        <view 
          v-for="(category, index) in categories" 
          :key="index"
          class="category-tab"
          :class="{ active: activeCategory === category }"
          @click="selectCategory(category)"
        >
          <text class="category-text">{{ category }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 临时：修复数据按钮 -->
    <view style="padding: 20rpx; text-align: center;" v-if="allAgents.length === 0">
      <button @click="fixAllData" style="background: #F44336; color: white; border-radius: 10rpx; margin-right: 20rpx; font-size: 28rpx;">全面修复数据库</button>
      <button @click="initTestData" style="background: #4C12A1; color: white; border-radius: 10rpx; font-size: 28rpx;">初始化测试数据</button>
    </view>
    
    <!-- 智能体列表 -->
    <view class="agent-grid">
      <view 
        v-for="agent in filteredAgents" 
        :key="agent.id" 
        class="agent-card"
        @click="openAgent(agent)"
      >
        <view class="agent-icon-wrapper" :style="{ backgroundColor: agent.iconBg }">
          <text class="agent-icon">{{ agent.icon }}</text>
        </view>
        <view class="agent-info">
          <text class="agent-name">{{ agent.name }}</text>
          <text class="agent-desc">{{ agent.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      favoriteAgents: [],
      allAgents: [],
      categories: ['全部', '教学设计', '学生管理', '教研分析', '家校沟通', '课程设计', '心理辅导'],
      activeCategory: '全部',
      loading: false
    };
  },
  computed: {
    filteredAgents() {
      let agents = this.allAgents;
      
      // 按分类过滤
      if (this.activeCategory !== '全部') {
        agents = agents.filter(agent => {
          // 匹配 navigation_tab 或 description
          return agent.navigation_tab === this.activeCategory || 
                 (agent.description && agent.description.includes(this.activeCategory));
        });
      }
      
      // 按搜索关键词过滤
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        agents = agents.filter(agent => 
          (agent.name && agent.name.toLowerCase().includes(keyword)) || 
          (agent.description && agent.description.toLowerCase().includes(keyword))
        );
      }
      
      return agents;
    }
  },
  onLoad() {
    this.loadData();
  },
  methods: {
    getMockData() {
      // 模拟智能体数据
      return [
        {
          _id: 'mock1',
          name: '教学设计助手',
          description: '帮助老师设计课程大纲、教学活动和评估方案',
          icon: '📚',
          icon_bg: '#FF6B6B',
          navigation_tab: '教学设计'
        },
        {
          _id: 'mock2',
          name: '作业批改助手',
          description: '快速批改学生作业，提供详细反馈和改进建议',
          icon: '✍️',
          icon_bg: '#4ECDC4',
          navigation_tab: '学生管理'
        },
        {
          _id: 'mock3',
          name: '试卷生成器',
          description: '根据知识点和难度自动生成试卷，节省命题时间',
          icon: '📋',
          icon_bg: '#95E1D3',
          navigation_tab: '教学设计'
        },
        {
          _id: 'mock4',
          name: '家长沟通助手',
          description: '起草家长通知、学生情况报告，增强家校联系',
          icon: '📧',
          icon_bg: '#FFD93D',
          navigation_tab: '家校沟通'
        },
        {
          _id: 'mock5',
          name: '成绩分析师',
          description: '分析班级成绩数据，生成可视化报告和改进建议',
          icon: '📊',
          icon_bg: '#6C5CE7',
          navigation_tab: '教研分析'
        },
        {
          _id: 'mock6',
          name: '课堂活动策划',
          description: '提供创意课堂活动方案，提高学生参与度',
          icon: '🎭',
          icon_bg: '#A29BFE',
          navigation_tab: '课程设计'
        },
        {
          _id: 'mock7',
          name: '学生心理辅导',
          description: '提供心理健康建议和情绪管理策略',
          icon: '💚',
          icon_bg: '#74B9FF',
          navigation_tab: '心理辅导'
        },
        {
          _id: 'mock8',
          name: '教案生成器',
          description: '基于课程标准快速生成教案，支持多种模板',
          icon: '📖',
          icon_bg: '#FD79A8',
          navigation_tab: '教学设计'
        }
      ];
    },
    async loadData() {
      try {
        this.loading = true;
        
        // 调用云函数获取智能体数据
        const agent = uniCloud.importObject('agent');
        const res = await agent.list({
          page: 1,
          page_size: 100
        });
        
        console.log('云函数响应:', res);
        console.log('res.data.list类型:', Array.isArray(res.data.list));
        console.log('res.data.list内容:', res.data.list);
        
        if (res.code === 0) {
          let rawList = res.data.list || [];
          console.log('rawList长度:', rawList.length);
          
          // 如果数据为空，使用模拟数据
          if (rawList.length === 0) {
            console.log('使用模拟数据');
            rawList = this.getMockData();
          }
          
          // 检查是否有嵌套的data结构
          if (rawList.length > 0 && rawList[0].data && Array.isArray(rawList[0].data)) {
            console.log('检测到嵌套data结构，展开数据');
            // 展开所有嵌套的data数组
            const expandedList = [];
            rawList.forEach(item => {
              if (item.data && Array.isArray(item.data)) {
                expandedList.push(...item.data);
              } else {
                expandedList.push(item);
              }
            });
            rawList = expandedList;
            console.log('展开后的数据数量:', rawList.length);
          }
          
          // 处理数据，添加默认值
          this.allAgents = rawList.map(agent => {
            console.log('处理agent:', agent.name || agent._id);
            return {
              ...agent,
              id: agent._id || agent.id,
              name: agent.name || '未命名智能体',
              description: agent.description || '',
              icon: agent.icon || '🤖',
              iconBg: agent.icon_bg || agent.iconBg || '#4C12A1'
            };
          });
          
          // 模拟常用智能体（取前5个）
          this.favoriteAgents = this.allAgents.slice(0, 5);
          
          console.log('加载智能体成功:', this.allAgents.length, '个');
          console.log('第一个智能体:', this.allAgents[0]);
        } else {
          console.error('加载失败:', res.message);
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载智能体失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    selectCategory(category) {
      this.activeCategory = category;
    },
    openAgent(agent) {
      console.log('打开智能体:', agent.name);
      // 跳转到AI对话页面
      uni.navigateTo({
        url: `/pages/chat/chat?agentId=${agent.id || agent._id}&agentName=${encodeURIComponent(agent.name)}&agentDesc=${encodeURIComponent(agent.description)}&agentIcon=${encodeURIComponent(agent.icon)}&agentType=${agent.type || 'teaching'}`
      });
    },
    async fixAllData() {
      try {
        uni.showModal({
          title: '确认修复',
          content: '将修复 agents、feishu-cards、web-cards 表的嵌套数据结构，是否继续？',
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '修复中...' });
              
              try {
                const fixObj = uniCloud.importObject('fix-all-data');
                const result = await fixObj.fix();
                
                uni.hideLoading();
                
                if (result.code === 0) {
                  const msg = `agents: 修复${result.data.agents.fixed}个\nfeishu-cards: 修复${result.data['feishu-cards'].fixed}个\nweb-cards: 修复${result.data['web-cards'].fixed}个`;
                  uni.showModal({
                    title: '修复完成',
                    content: msg,
                    showCancel: false,
                    success: () => {
                      setTimeout(() => {
                        this.loadData();
                      }, 500);
                    }
                  });
                } else {
                  uni.showToast({
                    title: result.message || '修复失败',
                    icon: 'none'
                  });
                }
              } catch (error) {
                uni.hideLoading();
                console.error('修复失败:', error);
                uni.showToast({
                  title: '修复失败',
                  icon: 'none'
                });
              }
            }
          }
        });
      } catch (error) {
        console.error('修复失败:', error);
      }
    },
    async fixAgents() {
      try {
        uni.showLoading({ title: '修复中...' });
        
        const fixObj = uniCloud.importObject('fix-agents');
        const res = await fixObj.fix();
        
        uni.hideLoading();
        
        if (res.code === 0) {
          uni.showToast({
            title: res.message,
            icon: 'success',
            duration: 2000
          });
          // 重新加载数据
          setTimeout(() => {
            this.loadData();
          }, 1000);
        } else {
          uni.showToast({
            title: res.message || '修复失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('修复失败:', error);
        uni.showToast({
          title: '修复失败',
          icon: 'none'
        });
      }
    },
    async initTestData() {
      try {
        uni.showLoading({ title: '初始化中...' });
        
        const testInit = uniCloud.importObject('test-init-agents');
        const res = await testInit.init();
        
        uni.hideLoading();
        
        if (res.code === 0) {
          uni.showToast({
            title: res.message,
            icon: 'success'
          });
          // 重新加载数据
          setTimeout(() => {
            this.loadData();
          }, 1000);
        } else {
          uni.showToast({
            title: res.message || '初始化失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('初始化失败:', error);
        uni.showToast({
          title: '初始化失败',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.agent-list-page {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: 100rpx;
}

/* 导航栏 */
.navbar {
  background-color: #4C12A1;
  padding: 24rpx 40rpx 28rpx;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.navbar-actions {
  display: flex;
  gap: 24rpx;
}

.navbar-icon {
  font-size: 44rpx;
}

/* 搜索栏 */
.search-bar {
  background-color: #FFFFFF;
  padding: 24rpx 32rpx;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 40rpx;
  padding: 16rpx 28rpx;
  gap: 16rpx;
}

.search-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  background-color: transparent;
  border: none;
}

/* 常用智能体 */
.favorite-section {
  background-color: #FFFFFF;
  margin-top: 16rpx;
  padding: 32rpx 0;
}

.section-header {
  padding: 0 32rpx 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.favorite-scroll {
  white-space: nowrap;
  padding: 0 32rpx;
}

.favorite-card {
  display: inline-block;
  margin-right: 32rpx;
  text-align: center;
  width: 140rpx;
}

.favorite-icon-wrapper {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16rpx;
}

.favorite-icon {
  font-size: 56rpx;
}

.favorite-name {
  font-size: 24rpx;
  color: #666666;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 分类标签 */
.category-section {
  background-color: #FFFFFF;
  padding: 24rpx 0;
  border-top: 1rpx solid #F0F0F0;
}

.category-scroll {
  white-space: nowrap;
  padding: 0 32rpx;
}

.category-tab {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #666666;
  background-color: #F5F5F5;
  transition: all 0.3s;
}

.category-tab.active {
  background-color: #4C12A1;
  color: #FFFFFF;
  font-weight: 500;
}

.category-text {
  white-space: nowrap;
}

/* 智能体列表 */
.agent-grid {
  padding: 24rpx 32rpx 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.agent-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0px 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 
              0px 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
  cursor: pointer;
}

.agent-card:active {
  transform: scale(0.98);
}

.agent-icon-wrapper {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.agent-icon {
  font-size: 56rpx;
}

.agent-info {
  width: 100%;
  text-align: center;
}

.agent-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-desc {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
</style>
