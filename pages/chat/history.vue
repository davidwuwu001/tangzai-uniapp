<template>
  <view class="history-page">
    <!-- 自定义导航栏 -->
    <view class="navbar">
      <view class="nav-left">
        <view class="nav-back" @click="goBack">
          <text>←</text>
        </view>
        <text class="nav-title">对话历史</text>
      </view>
      <view class="nav-search" @click="toggleSearch">
        <text>🔍</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view v-if="showSearch" class="search-bar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="searchKeyword"
          placeholder="搜索对话内容..."
          @input="handleSearch"
        />
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <!-- 空状态 -->
      <view v-if="filteredList.length === 0" class="empty-state">
        <view class="empty-icon">
          <text>💬</text>
        </view>
        <text class="empty-title">暂无对话记录</text>
        <text class="empty-desc">开始与智能体对话吧</text>
      </view>

      <!-- 历史列表 -->
      <view v-else>
        <view 
          v-for="(group, groupKey) in groupedHistory" 
          :key="groupKey"
        >
          <view class="group-header">
            <text>{{ groupKey }}</text>
          </view>

          <view 
            v-for="item in group" 
            :key="item.id"
            class="chat-item"
            @click="openChat(item)"
          >
            <view class="chat-header">
              <view class="agent-icon">
                <text>{{ item.agentIcon }}</text>
              </view>
              <view class="chat-info">
                <text class="chat-title">{{ item.lastMessage }}</text>
                <text class="chat-agent">{{ item.agentName }}</text>
              </view>
              <text class="chat-time">{{ formatTime(item.updatedAt) }}</text>
            </view>

            <view class="chat-preview">
              <text>{{ item.lastMessage }}</text>
            </view>

            <view class="chat-meta">
              <view class="chat-tags">
                <text class="chat-tag">{{ item.messageCount }} 条消息</text>
              </view>
              <view class="chat-actions">
                <view class="action-icon" @click.stop="toggleFavorite(item)">
                  <text>{{ item.isFavorite ? '⭐' : '☆' }}</text>
                </view>
                <view class="action-icon" @click.stop="confirmDelete(item)">
                  <text>🗑️</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部空白 -->
      <view style="height: 40rpx;"></view>
    </scroll-view>

    <!-- 底部工具栏 -->
    <view class="toolbar">
      <view class="toolbar-btn secondary" @click="confirmClearAll">
        <text>🗑️</text>
        <text>清空全部</text>
      </view>
      <view class="toolbar-btn primary" @click="newChat">
        <text>✨</text>
        <text>新建对话</text>
      </view>
    </view>
  </view>
</template>

<script>
import chatData from '@/mock/chat.js';

export default {
  data() {
    return {
      showSearch: false,
      searchKeyword: '',
      historyList: [],
      filteredList: []
    };
  },

  computed: {
    groupedHistory() {
      const groups = {
        '今天': [],
        '昨天': [],
        '本周': [],
        '更早': []
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const yesterday = today - 24 * 60 * 60 * 1000;
      const weekStart = today - 7 * 24 * 60 * 60 * 1000;

      this.filteredList.forEach(item => {
        const itemDate = item.updatedAt;

        if (itemDate >= today) {
          groups['今天'].push(item);
        } else if (itemDate >= yesterday) {
          groups['昨天'].push(item);
        } else if (itemDate >= weekStart) {
          groups['本周'].push(item);
        } else {
          groups['更早'].push(item);
        }
      });

      // 移除空分组
      Object.keys(groups).forEach(key => {
        if (groups[key].length === 0) {
          delete groups[key];
        }
      });

      return groups;
    }
  },

  onLoad() {
    this.loadHistory();
  },

  methods: {
    loadHistory() {
      // 从 Mock 数据加载
      this.historyList = chatData.conversationHistory || [];
      this.filteredList = [...this.historyList];
    },

    toggleSearch() {
      this.showSearch = !this.showSearch;
      if (!this.showSearch) {
        this.searchKeyword = '';
        this.filteredList = [...this.historyList];
      }
    },

    handleSearch() {
      const keyword = this.searchKeyword.toLowerCase().trim();
      
      if (!keyword) {
        this.filteredList = [...this.historyList];
        return;
      }

      this.filteredList = this.historyList.filter(item => {
        return (
          item.agentName.toLowerCase().includes(keyword) ||
          item.lastMessage.toLowerCase().includes(keyword)
        );
      });
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const yesterday = today - 24 * 60 * 60 * 1000;

      if (timestamp >= today) {
        // 今天显示时间
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (timestamp >= yesterday) {
        return '昨天';
      } else {
        // 其他显示日期
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
      }
    },

    openChat(item) {
      uni.navigateTo({
        url: `/pages/chat/chat?agentId=${item.agentId}&agentName=${item.agentName}&agentIcon=${item.agentIcon}&conversationId=${item.id}`
      });
    },

    toggleFavorite(item) {
      item.isFavorite = !item.isFavorite;
      uni.showToast({
        title: item.isFavorite ? '已收藏' : '已取消收藏',
        icon: 'success'
      });
    },

    confirmDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条对话记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.deleteChat(item);
          }
        }
      });
    },

    deleteChat(item) {
      const index = this.historyList.findIndex(h => h.id === item.id);
      if (index > -1) {
        this.historyList.splice(index, 1);
        this.filteredList = [...this.historyList];
        uni.showToast({
          title: '已删除',
          icon: 'success'
        });
      }
    },

    confirmClearAll() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有对话记录吗？此操作不可恢复！',
        success: (res) => {
          if (res.confirm) {
            this.clearAll();
          }
        }
      });
    },

    clearAll() {
      this.historyList = [];
      this.filteredList = [];
      uni.showToast({
        title: '已清空全部对话',
        icon: 'success'
      });
    },

    newChat() {
      uni.navigateTo({
        url: '/pages/teaching/teaching'
      });
    },

    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.history-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8F8F8;
}

/* 导航栏 */
.navbar {
  height: 112rpx;
  background: #4C12A1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  color: #FFFFFF;
  flex-shrink: 0;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #FFFFFF;
}

.nav-back:active {
  opacity: 0.8;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
}

.nav-search {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.nav-search:active {
  opacity: 0.8;
}

/* 搜索栏 */
.search-bar {
  background-color: #FFFFFF;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #EEEEEE;
  flex-shrink: 0;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 28rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: #999999;
}

.search-input {
  width: 100%;
  height: 72rpx;
  background-color: #F5F5F5;
  border-radius: 36rpx;
  padding: 0 32rpx 0 80rpx;
  font-size: 28rpx;
}

/* 内容区域 */
.content {
  flex: 1;
}

/* 分组标题 */
.group-header {
  padding: 32rpx 40rpx 16rpx;
  background-color: #F8F8F8;
  font-size: 26rpx;
  font-weight: 600;
  color: #999999;
}

/* 对话项 */
.chat-item {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin: 0 32rpx 24rpx;
  border-radius: 24rpx;
  box-shadow: 0rpx 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 
              0rpx 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  transition: all 0.2s;
}

.chat-item:active {
  transform: scale(0.98);
  box-shadow: 0rpx 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.10), 
              0rpx 4rpx 8rpx -2rpx rgba(0, 0, 0, 0.10);
}

.chat-header {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.agent-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.chat-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-agent {
  font-size: 24rpx;
  color: #999999;
}

.chat-time {
  font-size: 24rpx;
  color: #CCCCCC;
  flex-shrink: 0;
}

.chat-preview {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.chat-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-tags {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.chat-tag {
  padding: 6rpx 16rpx;
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.08), rgba(201, 100, 207, 0.08));
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #4C12A1;
}

.chat-actions {
  display: flex;
  gap: 16rpx;
}

.action-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  transition: background 0.2s;
}

.action-icon:active {
  background-color: #E0E0E0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 80rpx;
  text-align: center;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.1), rgba(201, 100, 207, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96rpx;
  margin-bottom: 48rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999999;
}

/* 底部工具栏 */
.toolbar {
  background-color: #FFFFFF;
  border-top: 2rpx solid #EEEEEE;
  padding: 24rpx 32rpx;
  display: flex;
  gap: 24rpx;
  flex-shrink: 0;
}

.toolbar-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.2s;
}

.toolbar-btn.secondary {
  background-color: #F5F5F5;
  color: #666666;
}

.toolbar-btn.primary {
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  color: #FFFFFF;
}

.toolbar-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>
