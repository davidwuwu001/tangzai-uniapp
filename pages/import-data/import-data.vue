<template>
  <view class="container">
    <view class="header">
      <text class="title">📦 用户数据导入</text>
    </view>
    
    <view class="stats-card">
      <text class="stats-title">当前数据库状态</text>
      <view class="stats-row">
        <text>用户总数：{{ currentTotal }}</text>
      </view>
      <button @click="checkExisting" size="mini" type="default">刷新统计</button>
    </view>
    
    <view class="actions">
      <button @click="importUsers" type="primary" :loading="importing" :disabled="importing">
        {{ importing ? '导入中...' : '开始导入用户数据 (133条)' }}
      </button>
      
      <button @click="importWithDedupe" type="warn" :loading="importing" :disabled="importing">
        {{ importing ? '导入中...' : '去重导入 (推荐)' }}
      </button>
    </view>
    
    <view class="log-box">
      <text class="log-title">📋 操作日志</text>
      <scroll-view scroll-y class="log-scroll">
        <view v-for="(log, index) in logs" :key="index" class="log-item">
          <text :class="['log-text', log.type]">{{ log.message }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
// 导入导出的用户数据
import usersData from '../../scripts/migration-output/users-data.json';

export default {
  data() {
    return {
      currentTotal: 0,
      importing: false,
      logs: []
    };
  },
  
  onLoad() {
    this.addLog('页面加载完成', 'info');
    this.addLog(`准备导入 ${usersData.length} 条用户数据`, 'info');
    this.checkExisting();
  },
  
  methods: {
    addLog(message, type = 'info') {
      const time = new Date().toLocaleTimeString();
      this.logs.push({
        message: `[${time}] ${message}`,
        type
      });
      
      // 自动滚动到底部
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select('.log-scroll').boundingClientRect();
        query.exec();
      });
    },
    
    async checkExisting() {
      try {
        this.addLog('正在查询现有数据...', 'info');
        const importUsersObj = uniCloud.importObject('import-users');
        const result = await importUsersObj.checkExisting();
        
        if (result.success) {
          this.currentTotal = result.total;
          this.addLog(`当前数据库有 ${result.total} 条用户记录`, 'success');
          
          if (result.recentUsers && result.recentUsers.length > 0) {
            this.addLog(`最近用户：${result.recentUsers.map(u => u.username).join(', ')}`, 'info');
          }
        } else {
          this.addLog('查询失败: ' + result.message, 'error');
        }
      } catch (e) {
        this.addLog('查询失败: ' + e.message, 'error');
        console.error(e);
      }
    },
    
    async importUsers() {
      if (this.importing) return;
      
      const confirm = await new Promise((resolve) => {
        uni.showModal({
          title: '确认导入',
          content: `将导入 ${usersData.length} 条用户数据，不会检查重复。确定继续？`,
          success: (res) => resolve(res.confirm)
        });
      });
      
      if (!confirm) return;
      
      this.importing = true;
      this.addLog('开始批量导入...', 'info');
      
      try {
        const importUsersObj = uniCloud.importObject('import-users');
        const result = await importUsersObj.batchImport(usersData);
        
        if (result.success) {
          this.addLog(`✅ ${result.message}`, 'success');
          this.addLog(`成功：${result.successCount} 条，失败：${result.errorCount} 条`, 'success');
        } else {
          this.addLog(`❌ ${result.message}`, 'error');
          if (result.errors) {
            result.errors.forEach(err => {
              this.addLog(`批次 ${err.batch} 失败: ${err.error}`, 'error');
            });
          }
        }
        
        // 刷新统计
        await this.checkExisting();
        
      } catch (e) {
        this.addLog('导入失败: ' + e.message, 'error');
        console.error(e);
      } finally {
        this.importing = false;
      }
    },
    
    async importWithDedupe() {
      if (this.importing) return;
      
      const confirm = await new Promise((resolve) => {
        uni.showModal({
          title: '确认导入',
          content: `将导入 ${usersData.length} 条用户数据，自动跳过已存在的手机号。确定继续？`,
          success: (res) => resolve(res.confirm)
        });
      });
      
      if (!confirm) return;
      
      this.importing = true;
      this.addLog('开始去重导入...', 'info');
      
      try {
        const importUsersObj = uniCloud.importObject('import-users');
        const result = await importUsersObj.importWithDedupe(usersData);
        
        if (result.success) {
          this.addLog(`✅ ${result.message}`, 'success');
          this.addLog(`总数：${result.total}，已存在：${result.existing}，新导入：${result.imported}`, 'success');
        } else {
          this.addLog(`❌ ${result.message}`, 'error');
        }
        
        // 刷新统计
        await this.checkExisting();
        
      } catch (e) {
        this.addLog('导入失败: ' + e.message, 'error');
        console.error(e);
      } finally {
        this.importing = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  background: #667eea;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: white;
}

.stats-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.stats-row {
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.actions button {
  border-radius: 20rpx;
}

.log-box {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  height: 600rpx;
}

.log-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.log-scroll {
  height: 500rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  padding: 20rpx;
  background: #fafafa;
}

.log-item {
  margin-bottom: 10rpx;
}

.log-text {
  font-size: 24rpx;
  line-height: 1.6;
}

.log-text.info {
  color: #666;
}

.log-text.success {
  color: #52c41a;
  font-weight: 500;
}

.log-text.error {
  color: #f5222d;
  font-weight: 500;
}
</style>
