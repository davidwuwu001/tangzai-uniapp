<template>
  <view class="detail-page">
    <!-- 自定义导航栏 -->
    <view class="navbar">
      <view class="nav-left">
        <view class="nav-back" @click="goBack">
          <text>←</text>
        </view>
        <text class="nav-title">咨询详情</text>
      </view>
      <view class="nav-actions">
        <view class="nav-action-btn" @click="shareRecord">
          <text>⋯</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <view v-if="record">
        <!-- 状态卡片 -->
        <view class="status-header">
          <view class="status-badge" :style="{ backgroundColor: record.statusColor + '20', color: record.statusColor }">
            <text>{{ record.status }}</text>
          </view>
          <text class="consultation-id">编号: {{ record.id }}</text>
        </view>

        <!-- 学生信息卡片 -->
        <view class="student-card">
          <view class="student-avatar">
            <text>{{ record.studentName.substr(0, 1) }}</text>
          </view>
          <view class="student-info">
            <text class="student-name">{{ record.studentName }}</text>
            <view class="student-meta">
              <text>{{ record.studentGrade }}</text>
              <text>·</text>
              <text>{{ record.studentGender }}</text>
              <text>·</text>
              <text>{{ record.studentAge }}岁</text>
            </view>
          </view>
          <view class="contact-btn" @click="contactParent">
            <text>📞</text>
          </view>
        </view>

        <!-- 基本信息 -->
        <view class="detail-section">
          <view class="section-header">
            <view class="section-title">
              <view class="section-icon"><text>📋</text></view>
              <text>基本信息</text>
            </view>
          </view>

          <view class="field-row">
            <text class="field-label">咨询类型</text>
            <text class="field-value highlight">{{ record.consultationType }}</text>
          </view>
          <view class="field-row">
            <text class="field-label">咨询时间</text>
            <text class="field-value">{{ record.consultationDate }} {{ record.consultationTime }}</text>
          </view>
          <view class="field-row">
            <text class="field-label">咨询时长</text>
            <text class="field-value">{{ record.duration }}</text>
          </view>
          <view class="field-row">
            <text class="field-label">咨询地点</text>
            <text class="field-value">{{ record.consultationLocation }}</text>
          </view>
          <view class="field-row">
            <text class="field-label">咨询师</text>
            <text class="field-value">{{ record.counselor }}</text>
          </view>
          <view class="field-row">
            <text class="field-label">优先级</text>
            <text class="field-value" :class="{ 'priority-high': record.priority === '高' }">
              {{ record.priority }}
            </text>
          </view>
        </view>

        <!-- 主诉问题 -->
        <view class="detail-section">
          <view class="section-header">
            <view class="section-title">
              <view class="section-icon"><text>💡</text></view>
              <text>主诉问题</text>
            </view>
          </view>
          <view class="main-issue">
            <text>{{ record.mainIssue }}</text>
          </view>
          <view class="tags">
            <text v-for="(tag, index) in record.tags" :key="index" class="tag">
              {{ tag }}
            </text>
          </view>
        </view>

        <!-- 详细描述 -->
        <view class="detail-section">
          <view class="section-header">
            <view class="section-title">
              <view class="section-icon"><text>📝</text></view>
              <text>详细记录</text>
            </view>
          </view>
          <view class="description">
            <text>{{ record.detailedDescription }}</text>
          </view>
        </view>

        <!-- 历史记录 -->
        <view v-if="record.previousRecords && record.previousRecords.length > 0" class="detail-section">
          <view class="section-header">
            <view class="section-title">
              <view class="section-icon"><text>📅</text></view>
              <text>历史记录</text>
            </view>
          </view>
          <view class="timeline">
            <view 
              v-for="(item, index) in record.previousRecords" 
              :key="index"
              class="timeline-item"
            >
              <view class="timeline-dot"></view>
              <view class="timeline-content">
                <text class="timeline-date">{{ item.date }}</text>
                <text class="timeline-text">{{ item.brief }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 状态标识 -->
        <view class="detail-section">
          <view class="section-header">
            <view class="section-title">
              <view class="section-icon"><text>🏷️</text></view>
              <text>记录状态</text>
            </view>
          </view>
          <view class="indicators">
            <view class="indicator-item" :class="{ active: record.followUp }">
              <text class="indicator-icon">🔔</text>
              <text class="indicator-label">需要跟进</text>
            </view>
            <view class="indicator-item" :class="{ active: record.parentNotified }">
              <text class="indicator-icon">📧</text>
              <text class="indicator-label">已通知家长</text>
            </view>
            <view class="indicator-item" :class="{ active: record.priority === '高' }">
              <text class="indicator-icon">⚠️</text>
              <text class="indicator-label">高优先级</text>
            </view>
          </view>
        </view>

        <!-- 底部操作 -->
        <view class="actions-section">
          <view class="action-btn secondary" @click="exportRecord">
            <text>📤 导出记录</text>
          </view>
          <view class="action-btn primary" @click="addFollowUp">
            <text>➕ 添加跟进</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-else class="loading-state">
        <text>加载中...</text>
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
      recordId: '',
      record: null
    };
  },

  onLoad(options) {
    if (options.recordId) {
      this.recordId = options.recordId;
      this.loadRecord();
    }
  },

  methods: {
    loadRecord() {
      // 从 Mock 数据加载详情
      this.record = feishuData.getRecordDetail(this.recordId);
      
      if (!this.record) {
        uni.showToast({
          title: '记录不存在',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },

    contactParent() {
      uni.showModal({
        title: '联系家长',
        content: `家长联系方式: ${this.record.parentContact}`,
        showCancel: false
      });
    },

    shareRecord() {
      uni.showActionSheet({
        itemList: ['编辑记录', '打印记录', '删除记录'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.editRecord();
          } else if (res.tapIndex === 1) {
            this.printRecord();
          } else if (res.tapIndex === 2) {
            this.deleteRecord();
          }
        }
      });
    },

    editRecord() {
      uni.showToast({
        title: '编辑功能待开发',
        icon: 'none'
      });
    },

    printRecord() {
      uni.showToast({
        title: '打印记录',
        icon: 'success'
      });
    },

    deleteRecord() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条咨询记录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已删除',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          }
        }
      });
    },

    exportRecord() {
      uni.showToast({
        title: '导出成功',
        icon: 'success'
      });
    },

    addFollowUp() {
      uni.showToast({
        title: '添加跟进记录',
        icon: 'none'
      });
    },

    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.detail-page {
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

.nav-actions {
  display: flex;
  gap: 16rpx;
}

.nav-action-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #FFFFFF;
}

.nav-action-btn:active {
  opacity: 0.8;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 32rpx;
}

/* 状态卡片 */
.status-header {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0rpx 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10);
  text-align: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.consultation-id {
  font-size: 26rpx;
  color: #999999;
}

/* 学生信息卡片 */
.student-card {
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.05), rgba(201, 100, 207, 0.05));
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.student-avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 600;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.student-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.student-meta {
  font-size: 26rpx;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.contact-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.contact-btn:active {
  transform: scale(0.95);
}

/* 详情分组 */
.detail-section {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0rpx 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.section-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.1), rgba(201, 100, 207, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

/* 字段行 */
.field-row {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
}

.field-row:last-child {
  border-bottom: none;
}

.field-label {
  width: 180rpx;
  font-size: 28rpx;
  color: #999999;
  flex-shrink: 0;
}

.field-value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.field-value.highlight {
  color: #4C12A1;
  font-weight: 500;
}

.field-value.priority-high {
  color: #EF4A81;
  font-weight: 500;
}

/* 主诉问题 */
.main-issue {
  font-size: 32rpx;
  font-weight: 600;
  color: #4C12A1;
  margin-bottom: 24rpx;
  line-height: 1.6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.08), rgba(201, 100, 207, 0.08));
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #4C12A1;
}

/* 详细描述 */
.description {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 时间线 */
.timeline {
  padding-left: 40rpx;
}

.timeline-item {
  position: relative;
  padding-bottom: 40rpx;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -40rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #4C12A1;
}

.timeline-item:not(:last-child) .timeline-dot::after {
  content: '';
  position: absolute;
  left: 7rpx;
  top: 20rpx;
  width: 2rpx;
  height: 60rpx;
  background-color: #E0E0E0;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.timeline-date {
  font-size: 26rpx;
  color: #999999;
}

.timeline-text {
  font-size: 28rpx;
  color: #666666;
}

/* 状态指示器 */
.indicators {
  display: flex;
  gap: 24rpx;
}

.indicator-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  opacity: 0.5;
  transition: all 0.3s;
}

.indicator-item.active {
  opacity: 1;
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.1), rgba(201, 100, 207, 0.1));
}

.indicator-icon {
  font-size: 40rpx;
}

.indicator-label {
  font-size: 24rpx;
  color: #666666;
  text-align: center;
}

/* 操作按钮 */
.actions-section {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.action-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn.secondary {
  background-color: #F5F5F5;
  color: #666666;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  color: #FFFFFF;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 160rpx 80rpx;
  font-size: 28rpx;
  color: #999999;
}
</style>
