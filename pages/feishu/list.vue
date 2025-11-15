<template>
  <view class="feishu-list-page">
    <!-- 自定义导航栏 -->
    <view class="navbar">
      <view class="nav-left">
        <view class="nav-back" @click="goBack">
          <text>←</text>
        </view>
        <text class="nav-title">{{ cardInfo.title }}</text>
      </view>
      <view class="nav-search" @click="toggleFilter">
        <text>🔍</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view v-if="showFilter" class="filter-bar">
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-item">
          <text class="filter-label">类型</text>
          <picker 
            mode="selector" 
            :range="filterOptions.consultationType" 
            range-key="label"
            @change="onTypeChange"
          >
            <view class="filter-value">
              {{ currentFilters.typeLabel || '全部' }} ▾
            </view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">状态</text>
          <picker 
            mode="selector" 
            :range="filterOptions.status" 
            range-key="label"
            @change="onStatusChange"
          >
            <view class="filter-value">
              {{ currentFilters.statusLabel || '全部' }} ▾
            </view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">优先级</text>
          <picker 
            mode="selector" 
            :range="filterOptions.priority" 
            range-key="label"
            @change="onPriorityChange"
          >
            <view class="filter-value">
              {{ currentFilters.priorityLabel || '全部' }} ▾
            </view>
          </picker>
        </view>
      </scroll-view>

      <view class="filter-reset" @click="resetFilters">
        <text>重置</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">总记录</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.today }}</text>
        <text class="stat-label">今日新增</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.pending }}</text>
        <text class="stat-label">待跟进</text>
      </view>
    </view>

    <!-- 列表区域 -->
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <!-- 空状态 -->
      <view v-if="filteredRecords.length === 0" class="empty-state">
        <view class="empty-icon">
          <text>📋</text>
        </view>
        <text class="empty-title">暂无记录</text>
        <text class="empty-desc">当前筛选条件下没有找到记录</text>
      </view>

      <!-- 记录列表 -->
      <view v-else>
        <view 
          v-for="record in filteredRecords" 
          :key="record.id"
          class="record-item"
          @click="viewDetail(record)"
        >
          <!-- 头部 -->
          <view class="record-header">
            <view class="student-info">
              <view class="student-avatar">
                <text>{{ record.studentName.substr(0, 1) }}</text>
              </view>
              <view class="student-details">
                <text class="student-name">{{ record.studentName }}</text>
                <text class="student-grade">{{ record.studentGrade }} · {{ record.studentGender }}</text>
              </view>
            </view>
            <view class="status-badge" :style="{ backgroundColor: record.statusColor + '20', color: record.statusColor }">
              <text>{{ record.status }}</text>
            </view>
          </view>

          <!-- 主要信息 -->
          <view class="record-main">
            <view class="info-row">
              <text class="info-label">类型</text>
              <text class="info-value">{{ record.consultationType }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">时间</text>
              <text class="info-value">{{ record.consultationDate }} {{ record.consultationTime }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">主诉</text>
              <text class="info-value highlight">{{ record.mainIssue }}</text>
            </view>
          </view>

          <!-- 简述 -->
          <view class="record-brief">
            <text>{{ record.brief }}</text>
          </view>

          <!-- 底部信息 -->
          <view class="record-footer">
            <view class="tags">
              <text 
                v-for="(tag, index) in record.tags" 
                :key="index"
                class="tag"
              >
                {{ tag }}
              </text>
            </view>
            <view class="meta-info">
              <text class="counselor">{{ record.counselor }}</text>
              <text class="duration">{{ record.duration }}</text>
            </view>
          </view>

          <!-- 标识 -->
          <view class="record-indicators">
            <view v-if="record.priority === '高'" class="indicator priority-high">
              <text>⚠️ 高优先级</text>
            </view>
            <view v-if="record.followUp" class="indicator follow-up">
              <text>🔔 需跟进</text>
            </view>
            <view v-if="record.parentNotified" class="indicator parent-notified">
              <text>✓ 已通知家长</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部空白 -->
      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script>
import feishuData from '@/mock/feishu.js';

export default {
  data() {
    return {
      cardInfo: {
        id: '',
        title: '咨询记录',
        description: ''
      },
      showFilter: false,
      currentFilters: {
        type: '',
        typeLabel: '全部',
        status: '',
        statusLabel: '全部',
        priority: '',
        priorityLabel: '全部'
      },
      filterOptions: {
        consultationType: [],
        status: [],
        priority: []
      },
      records: [],
      filteredRecords: [],
      stats: {
        total: 0,
        today: 0,
        pending: 0
      }
    };
  },

  onLoad(options) {
    // 获取卡片信息
    if (options.cardId) {
      const card = feishuData.cards.find(c => c.id === options.cardId);
      if (card) {
        this.cardInfo = card;
      }
    }

    // 加载数据
    this.loadData();
    this.loadFilters();
  },

  methods: {
    async loadData() {
      try {
        uni.showLoading({ title: '加载中...' });
        
        const feishu = uniCloud.importObject('feishu');
        
        // 1. 获取飞书卡片列表
        const cardRes = await feishu.list({
          page: 1,
          page_size: 100
        });
        
        if (cardRes.code === 0 && cardRes.data.list.length > 0) {
          // 如果没有指定 cardId，使用第一个卡片
          if (!this.cardInfo.id && cardRes.data.list[0]) {
            this.cardInfo = {
              id: cardRes.data.list[0]._id,
              title: cardRes.data.list[0].title,
              description: cardRes.data.list[0].description
            };
          }
          
          // 2. 获取飞书表格数据
          try {
            const tableRes = await feishu.fetchTableData({
              card_id: this.cardInfo.id,
              page_size: 50
            });
            
            if (tableRes.code === 0 && tableRes.data.items) {
              // 转换飞书数据为列表格式
              this.records = this.transformFeishuData(tableRes.data.items);
              this.filteredRecords = [...this.records];
              console.log('加载飞书表格数据成功:', this.records.length, '条');
            } else {
              throw new Error('获取飞书表格数据失败');
            }
          } catch (tableError) {
            console.warn('获取飞书表格数据失败，使用Mock数据:', tableError.message);
            // 使用 Mock 数据作为后备
            this.records = feishuData.consultationRecords || [];
            this.filteredRecords = [...this.records];
          }
        } else {
          console.log('暂无飞书卡片，使用 Mock 数据');
          this.records = feishuData.consultationRecords || [];
          this.filteredRecords = [...this.records];
        }
        
        this.calculateStats();
        uni.hideLoading();
      } catch (error) {
        console.error('加载飞书数据失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '加载失败，使用演示数据',
          icon: 'none'
        });
        
        this.records = feishuData.consultationRecords || [];
        this.filteredRecords = [...this.records];
        this.calculateStats();
      }
    },
    
    // 转换飞书数据为列表项格式
    transformFeishuData(items) {
      return items.map((item, index) => {
        const fields = item.fields || {};
        
        // 根据飞书表格字段映射数据
        return {
          id: item.record_id || `feishu_${index}`,
          studentName: this.getFieldValue(fields, ['学生姓名', '姓名', 'name']),
          studentGrade: this.getFieldValue(fields, ['年级', 'grade', '班级']),
          studentGender: this.getFieldValue(fields, ['性别', 'gender']),
          consultationType: this.getFieldValue(fields, ['咨询类型', '类型', 'type']),
          consultationDate: this.getFieldValue(fields, ['咨询日期', '日期', 'date']),
          consultationTime: this.getFieldValue(fields, ['咨询时间', '时间', 'time']),
          mainIssue: this.getFieldValue(fields, ['主诉问题', '主诉', '问题']),
          brief: this.getFieldValue(fields, ['简述', '描述', 'description']),
          status: this.getFieldValue(fields, ['状态', 'status']) || '进行中',
          statusColor: this.getStatusColor(this.getFieldValue(fields, ['状态', 'status'])),
          counselor: this.getFieldValue(fields, ['咨询师', '老师', 'counselor']),
          duration: this.getFieldValue(fields, ['时长', 'duration']) || '30分钟',
          priority: this.getFieldValue(fields, ['优先级', 'priority']) || '中',
          followUp: this.getFieldValue(fields, ['需要跟进']) === true || this.getFieldValue(fields, ['需要跟进']) === '是',
          parentNotified: this.getFieldValue(fields, ['已通知家长']) === true || this.getFieldValue(fields, ['已通知家长']) === '是',
          tags: this.getTagsFromFields(fields)
        };
      });
    },
    
    // 从飞书字段中获取值（支持多个可能的字段名）
    getFieldValue(fields, possibleNames) {
      for (const name of possibleNames) {
        if (fields[name] !== undefined && fields[name] !== null) {
          return fields[name];
        }
      }
      return '';
    },
    
    // 获取状态颜色
    getStatusColor(status) {
      const colorMap = {
        '完成': '#43A047',
        '进行中': '#FFA300',
        '待跟进': '#EF4A81',
        '已取消': '#999999'
      };
      return colorMap[status] || '#4C12A1';
    },
    
    // 从字段中提取标签
    getTagsFromFields(fields) {
      const tags = [];
      const tagField = fields['标签'] || fields['tags'];
      
      if (Array.isArray(tagField)) {
        return tagField;
      } else if (typeof tagField === 'string') {
        return tagField.split(',').map(t => t.trim());
      }
      
      return tags;
    },

    loadFilters() {
      this.filterOptions = feishuData.filterOptions;
    },

    calculateStats() {
      this.stats.total = this.records.length;
      
      // 今日新增（模拟）
      const today = new Date().toISOString().split('T')[0];
      this.stats.today = this.records.filter(r => r.consultationDate === today).length;
      
      // 待跟进
      this.stats.pending = this.records.filter(r => r.status === '待跟进').length;
    },

    toggleFilter() {
      this.showFilter = !this.showFilter;
    },

    onTypeChange(e) {
      const index = e.detail.value;
      const option = this.filterOptions.consultationType[index];
      this.currentFilters.type = option.value;
      this.currentFilters.typeLabel = option.label;
      this.applyFilters();
    },

    onStatusChange(e) {
      const index = e.detail.value;
      const option = this.filterOptions.status[index];
      this.currentFilters.status = option.value;
      this.currentFilters.statusLabel = option.label;
      this.applyFilters();
    },

    onPriorityChange(e) {
      const index = e.detail.value;
      const option = this.filterOptions.priority[index];
      this.currentFilters.priority = option.value;
      this.currentFilters.priorityLabel = option.label;
      this.applyFilters();
    },

    applyFilters() {
      this.filteredRecords = this.records.filter(record => {
        let match = true;

        if (this.currentFilters.type) {
          match = match && record.consultationType === this.currentFilters.type;
        }

        if (this.currentFilters.status) {
          match = match && record.status === this.currentFilters.status;
        }

        if (this.currentFilters.priority) {
          match = match && record.priority === this.currentFilters.priority;
        }

        return match;
      });
    },

    resetFilters() {
      this.currentFilters = {
        type: '',
        typeLabel: '全部',
        status: '',
        statusLabel: '全部',
        priority: '',
        priorityLabel: '全部'
      };
      this.filteredRecords = [...this.records];
    },

    viewDetail(record) {
      uni.navigateTo({
        url: `/pages/feishu/detail?recordId=${record.id}`
      });
    },

    loadMore() {
      // TODO: 实现分页加载
      console.log('加载更多');
    },

    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.feishu-list-page {
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
  flex: 1;
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

/* 筛选栏 */
.filter-bar {
  background-color: #FFFFFF;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #EEEEEE;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.filter-scroll {
  flex: 1;
  white-space: nowrap;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  margin-right: 32rpx;
}

.filter-label {
  font-size: 26rpx;
  color: #999999;
}

.filter-value {
  font-size: 28rpx;
  color: #4C12A1;
  font-weight: 500;
}

.filter-reset {
  padding: 8rpx 24rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #666666;
}

.filter-reset:active {
  background-color: #E0E0E0;
}

/* 统计卡片 */
.stats-card {
  background-color: #FFFFFF;
  margin: 24rpx 32rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  box-shadow: 0rpx 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 44rpx;
  font-weight: 600;
  color: #4C12A1;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background-color: #EEEEEE;
  margin: 0 24rpx;
}

/* 列表 */
.content {
  flex: 1;
  padding: 0 32rpx;
}

/* 记录卡片 */
.record-item {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0rpx 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 
              0rpx 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  transition: all 0.2s;
}

.record-item:active {
  transform: scale(0.98);
  box-shadow: 0rpx 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.10), 
              0rpx 4rpx 8rpx -2rpx rgba(0, 0, 0, 0.10);
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.student-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.student-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.student-grade {
  font-size: 24rpx;
  color: #999999;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.record-main {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background-color: #F8F8F8;
  border-radius: 16rpx;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-label {
  width: 80rpx;
  font-size: 26rpx;
  color: #999999;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.info-value.highlight {
  color: #4C12A1;
  font-weight: 500;
}

.record-brief {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.record-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 2rpx solid #F5F5F5;
  margin-bottom: 16rpx;
}

.tags {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  flex: 1;
}

.tag {
  padding: 6rpx 16rpx;
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.08), rgba(201, 100, 207, 0.08));
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #4C12A1;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 24rpx;
  color: #999999;
}

.record-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.indicator {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.priority-high {
  background-color: rgba(239, 74, 129, 0.1);
  color: #EF4A81;
}

.follow-up {
  background-color: rgba(255, 163, 0, 0.1);
  color: #FFA300;
}

.parent-notified {
  background-color: rgba(67, 160, 71, 0.1);
  color: #43A047;
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
</style>
