<template>
  <view class="service-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="navbar-title">咨询日历</text>
    </view>
    
    <!-- 月份选择器 -->
    <view class="month-selector">
      <view class="month-arrow" @click="changeMonth(-1)">◀</view>
      <text class="current-month">{{ currentMonthText }}</text>
      <view class="month-arrow" @click="changeMonth(1)">▶</view>
    </view>
    
    <!-- 统计卡片 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ monthStats.totalConsultations }}</text>
        <text class="stat-label">本月咨询</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ monthStats.todayScheduled }}</text>
        <text class="stat-label">今日安排</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ monthStats.pending }}</text>
        <text class="stat-label">待处理</text>
      </view>
    </view>
    
    <!-- 日历 -->
    <view class="calendar-container">
      <view class="calendar-weekdays">
        <text class="weekday" v-for="day in weekdays" :key="day">{{ day }}</text>
      </view>
      <view class="calendar-days">
        <view 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="calendar-day"
          :class="getDayClass(day)"
          @click="selectDay(day)"
        >
          <text v-if="day.date" class="day-number">{{ day.day }}</text>
          <text v-if="day.recordCount" class="record-count">{{ day.recordCount }}</text>
        </view>
      </view>
    </view>
    
    <!-- 今日咨询 -->
    <view class="today-section">
      <text class="section-title">今日咨询</text>
      <view class="consultation-list">
        <view 
          v-for="consultation in todayConsultations"
          :key="consultation.id"
          class="consultation-card"
          @click="viewConsultation(consultation)"
        >
          <view class="consultation-header">
            <view>
              <text class="consultation-name">{{ consultation.clientName }}</text>
              <text class="consultation-time">⏰ {{ consultation.startTime }} - {{ consultation.endTime }}</text>
            </view>
            <view class="consultation-status" :class="consultation.status">
              {{ consultation.statusText }}
            </view>
          </view>
          <text class="consultation-info">
            📍 咨询类型: {{ consultation.type }} | 顾问: {{ consultation.advisor }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import serviceData from '@/mock/service.js';

export default {
  data() {
    return {
      currentYear: 2024,
      currentMonth: 11,
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      monthStats: {
        totalConsultations: 0,
        todayScheduled: 0,
        pending: 0
      },
      calendarRecords: {},
      todayConsultations: []
    };
  },
  
  computed: {
    currentMonthText() {
      return `${this.currentYear}年${this.currentMonth}月`;
    },
    calendarDays() {
      const days = [];
      const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
      const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
      
      // 添加空白占位
      for (let i = 0; i < firstDay; i++) {
        days.push({ date: null });
      }
      
      // 添加当月日期
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        days.push({
          date: dateStr,
          day,
          recordCount: this.calendarRecords[dateStr] || 0
        });
      }
      
      return days;
    }
  },
  
  onLoad() {
    this.loadData();
  },
  
  methods: {
    loadData() {
      this.monthStats = serviceData.monthStats;
      this.calendarRecords = serviceData.calendarRecords;
      this.todayConsultations = serviceData.todayConsultations;
    },
    
    changeMonth(delta) {
      this.currentMonth += delta;
      if (this.currentMonth > 12) {
        this.currentMonth = 1;
        this.currentYear++;
      } else if (this.currentMonth < 1) {
        this.currentMonth = 12;
        this.currentYear--;
      }
    },
    
    getDayClass(day) {
      if (!day.date) return 'empty';
      
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const classes = [];
      if (day.date === todayStr) classes.push('today');
      if (day.recordCount > 0) classes.push('has-records');
      
      return classes.join(' ');
    },
    
    selectDay(day) {
      if (!day.date) return;
      console.log('选中日期:', day.date);
      // TODO: 显示该日的咨询列表
    },
    
    viewConsultation(consultation) {
      console.log('查看咨询:', consultation);
      uni.showToast({
        title: `查看 ${consultation.clientName} 的咨询`,
        icon: 'none'
      });
    }
  }
}
</script>

<style scoped>
.service-page {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: 100rpx;
}

/* 导航栏 */
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

/* 月份选择器 */
.month-selector {
  background-color: #FFFFFF;
  padding: 32rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-arrow {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #666666;
  transition: all 0.2s;
}

.month-arrow:active {
  background-color: #E5E5E5;
  transform: scale(0.95);
}

.current-month {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

/* 统计卡片 */
.stats-bar {
  background-color: #FFFFFF;
  padding: 32rpx 40rpx;
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  flex: 1;
  background-color: rgba(76, 18, 161, 0.08);
  padding: 32rpx 24rpx;
  border-radius: 24rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #4C12A1;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}

/* 日历 */
.calendar-container {
  background-color: #FFFFFF;
  padding: 32rpx 40rpx 40rpx;
  margin-bottom: 24rpx;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.weekday {
  text-align: center;
  font-size: 24rpx;
  color: #999999;
  font-weight: 500;
  padding: 16rpx 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16rpx;
}

.calendar-day {
  aspect-ratio: 1;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  position: relative;
  transition: all 0.2s;
  background-color: #FAFAFA;
  color: #333333;
}

.calendar-day:active {
  transform: scale(0.95);
}

.calendar-day.empty {
  pointer-events: none;
  background-color: transparent;
}

.calendar-day.today {
  background-color: #4C12A1;
  color: #FFFFFF;
  font-weight: 600;
}

.calendar-day.has-records {
  background-color: rgba(239, 74, 129, 0.12);
  border: 4rpx solid #EF4A81;
}

.calendar-day.has-records .day-number {
  font-weight: 600;
  color: #EF4A81;
}

.record-count {
  position: absolute;
  bottom: 8rpx;
  font-size: 20rpx;
  background-color: #EF4A81;
  color: #FFFFFF;
  padding: 2rpx 12rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

/* 今日咨询 */
.today-section {
  padding: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 32rpx;
}

.consultation-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.consultation-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0px 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.10), 0px 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.10);
  transition: transform 0.2s;
}

.consultation-card:active {
  transform: scale(0.98);
}

.consultation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.consultation-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.consultation-time {
  font-size: 26rpx;
  color: #666666;
  display: block;
}

.consultation-status {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.consultation-status.pending {
  background-color: rgba(255, 163, 0, 0.15);
  color: #FFA300;
}

.consultation-status.completed {
  background-color: rgba(45, 204, 211, 0.15);
  color: #2DCCD3;
}

.consultation-status.ongoing {
  background-color: rgba(76, 18, 161, 0.15);
  color: #4C12A1;
}

.consultation-info {
  font-size: 26rpx;
  color: #999999;
  line-height: 1.5;
}
</style>
