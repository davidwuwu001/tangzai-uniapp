<template>
  <view 
    class="universal-card" 
    :class="{ 'grid-mode': displayMode === 'grid' }"
    @click="handleClick"
  >
    <!-- 卡片图标 -->
    <view class="card-icon" v-if="card.icon">
      <text>{{ card.icon }}</text>
    </view>
    
    <!-- 卡片内容 -->
    <view class="card-content">
      <!-- 标题 -->
      <view class="card-title">{{ card.title }}</view>
      
      <!-- 描述 -->
      <view class="card-desc" v-if="card.description">
        {{ card.description }}
      </view>
      
      <!-- 标签 -->
      <view class="card-tags" v-if="card.tags && card.tags.length">
        <view 
          v-for="(tag, index) in card.tags" 
          :key="index" 
          class="tag"
        >
          {{ tag }}
        </view>
      </view>
      
      <!-- 部门标签 -->
      <view class="card-department" v-if="card.department">
        {{ card.department }}
      </view>
    </view>
    
    <!-- 箭头（列表模式） -->
    <view class="card-arrow" v-if="displayMode === 'list'">›</view>
  </view>
</template>

<script>
export default {
  name: 'UniversalCard',
  props: {
    // 卡片数据
    card: {
      type: Object,
      required: true,
      default: () => ({
        id: 0,
        title: '',
        description: '',
        icon: '',
        tags: [],
        department: ''
      })
    },
    // 显示模式：list（列表）/ grid（网格）
    displayMode: {
      type: String,
      default: 'list',
      validator: (value) => ['list', 'grid'].includes(value)
    }
  },
  
  methods: {
    handleClick() {
      this.$emit('click', this.card)
    }
  }
}
</script>

<style scoped>
/* 通用卡片样式 */
.universal-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  margin-bottom: 20rpx;
}

.universal-card:active {
  transform: scale(0.98);
  opacity: 0.8;
}

/* 网格模式 */
.universal-card.grid-mode {
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40rpx 20rpx;
}

/* 卡片图标 */
.card-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.grid-mode .card-icon {
  margin-right: 0;
  margin-bottom: 20rpx;
  font-size: 80rpx;
}

/* 卡片内容 */
.card-content {
  flex: 1;
  min-width: 0;
}

.grid-mode .card-content {
  width: 100%;
}

/* 标题 */
.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-mode .card-title {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 描述 */
.card-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.grid-mode .card-desc {
  -webkit-line-clamp: 3;
}

/* 标签 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.grid-mode .card-tags {
  justify-content: center;
}

.tag {
  display: inline-block;
  font-size: 22rpx;
  color: #667eea;
  background: #f0f2ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

/* 部门标签 */
.card-department {
  display: inline-block;
  font-size: 22rpx;
  color: #667eea;
  background: #f0f2ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  margin-top: 10rpx;
}

/* 箭头 */
.card-arrow {
  font-size: 50rpx;
  color: #ddd;
  font-weight: 300;
  flex-shrink: 0;
  margin-left: 20rpx;
}
</style>
