<template>
  <view class="learning-page">
    <view class="navbar">
      <text class="navbar-title">学习资料</text>
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
    
    <!-- 资料列表 -->
    <view class="materials-list">
      <view 
        v-for="material in filteredMaterials" 
        :key="material.id"
        class="material-card"
        @click="openMaterial(material)"
      >
        <view class="material-icon" :style="{ backgroundColor: material.iconBg }">
          <text class="icon-emoji">{{ material.icon }}</text>
        </view>
        <view class="material-info">
          <text class="material-title">{{ material.title }}</text>
          <text class="material-meta">
            📦 {{ material.fileTypeText }} | {{ material.size }} | 上传于 {{ material.uploadDate }}
          </text>
          <view class="material-tags">
            <text v-for="(tag, idx) in material.tags" :key="idx" class="material-tag">
              {{ tag }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import learningData from '@/mock/learning.js';

export default {
  data() {
    return {
      categories: [],
      allMaterials: [],
      activeCategory: '全部'
    };
  },
  
  computed: {
    filteredMaterials() {
      if (this.activeCategory === '全部') {
        return this.allMaterials;
      }
      return this.allMaterials.filter(material => 
        material.categories.includes(this.activeCategory)
      );
    }
  },
  
  onLoad() {
    this.loadData();
  },
  
  methods: {
    async loadData() {
      try {
        // 加载飞书卡片
        const feishu = uniCloud.importObject('feishu');
        const feishuRes = await feishu.list({
          navigation_tab: 'AI工具箱', // 或 '学习资料'
          page: 1,
          page_size: 50
        });
        
        if (feishuRes.code === 0 && feishuRes.data.list.length > 0) {
          // 将飞书卡片添加到资料列表
          const feishuCards = feishuRes.data.list.map(card => ({
            id: card._id,
            title: card.title,
            icon: '📄',
            iconBg: '#4C12A1',
            fileTypeText: '飞书表格',
            size: '在线数据',
            uploadDate: new Date(card.created_at).toLocaleDateString(),
            tags: ['实时', '协作'],
            categories: ['全部', '飞书数据'],
            type: 'feishu',
            cardData: card
          }));
          
          // 合并Mock数据和飞书数据
          this.allMaterials = [...feishuCards, ...learningData.materials];
          
          // 添加飞书数据分类
          if (!this.categories.includes('飞书数据')) {
            this.categories = ['全部', '飞书数据', ...learningData.categories.slice(1)];
          }
          
          console.log('加载飞书卡片成功:', feishuCards.length, '个');
        } else {
          // 没有飞书卡片，只显示Mock数据
          this.categories = learningData.categories;
          this.allMaterials = learningData.materials;
        }
      } catch (error) {
        console.error('加载飞书卡片失败:', error);
        // 失败时使用Mock数据
        this.categories = learningData.categories;
        this.allMaterials = learningData.materials;
      }
    },
    
    selectCategory(category) {
      this.activeCategory = category;
    },
    
    openMaterial(material) {
      console.log('打开资料:', material.title);
      
      // 如果是飞书卡片，跳转到飞书列表页
      if (material.type === 'feishu') {
        uni.navigateTo({
          url: `/pages/feishu/list?cardId=${material.id}`
        });
        return;
      }
      
      // 其他类型的资料
      uni.showToast({
        title: `打开 ${material.title}`,
        icon: 'none'
      });
    }
  }
};
</script>

<style scoped>
.learning-page {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: 100rpx;
}

.navbar {
  background-color: #4C12A1;
  padding: 24rpx 40rpx 28rpx;
  text-align: center;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

/* 分类标签 */
.category-section {
  background-color: #FFFFFF;
  padding: 32rpx 40rpx;
}

.category-scroll {
  white-space: nowrap;
}

.category-tab {
  display: inline-block;
  padding: 12rpx 32rpx;
  margin-right: 16rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666666;
  background-color: #F5F5F5;
  transition: all 0.3s;
  border: 2rpx solid transparent;
}

.category-tab.active {
  background-color: rgba(76, 18, 161, 0.12);
  border-color: #4C12A1;
  color: #4C12A1;
  font-weight: 500;
}

.category-text {
  white-space: nowrap;
}

/* 资料列表 */
.materials-list {
  padding: 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.material-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0px 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 0px 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  display: flex;
  gap: 24rpx;
  transition: transform 0.2s;
}

.material-card:active {
  transform: scale(0.98);
}

.material-icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 56rpx;
}

.material-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.material-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.material-meta {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.material-tags {
  display: flex;
  gap: 12rpx;
}

.material-tag {
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  background-color: rgba(76, 18, 161, 0.12);
  color: #4C12A1;
}
</style>
