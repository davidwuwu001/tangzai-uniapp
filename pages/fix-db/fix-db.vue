<template>
  <view class="fix-page">
    <view class="header">
      <text class="title">数据库修复工具</text>
    </view>
    
    <view class="content">
      <view class="info-box">
        <text class="info-text">检测到数据库中有嵌套的data结构</text>
        <text class="info-text">将修复以下表：</text>
        <text class="table-name">• uni-id-users（用户表）</text>
        <text class="table-name">• agents（智能体）</text>
        <text class="table-name">• feishu-cards（飞书卡片）</text>
        <text class="table-name">• web-cards（网页卡片）</text>
        <text class="table-name">• cities（城市）</text>
        <text class="table-name">• departments（部门）</text>
        <text class="table-name">• models（模型）</text>
      </view>
      
      <button 
        class="fix-btn" 
        @click="executeFix"
        :disabled="loading"
      >
        {{ loading ? '修复中...' : '立即修复' }}
      </button>
      
      <button 
        class="rebuild-btn" 
        @click="rebuildUsers"
        :disabled="loading"
      >
        重建用户数据
      </button>
      
      <view class="result-box" v-if="result">
        <text class="result-title">修复结果：</text>
        <text class="result-item" v-for="(value, key) in result" :key="key">
          {{ key }}: 总计{{ value.total }}条, 修复{{ value.fixed }}条, 跳过{{ value.skipped }}条
        </text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      result: null
    }
  },
  
  onLoad() {
    // 页面加载时自动执行修复
    setTimeout(() => {
      this.executeFix();
    }, 500);
  },
  
  methods: {
    async rebuildUsers() {
      try {
        this.loading = true;
        
        console.log('开始重建用户...');
        
        const rebuildObj = uniCloud.importObject('rebuild-users');
        const res = await rebuildObj.rebuild();
        
        console.log('重建结果:', res);
        
        if (res.code === 0) {
          const msg = res.data ? 
            `用户名: ${res.data.username}\n手机号: ${res.data.mobile}\n密码: ${res.data.defaultPassword}` :
            res.message;
          
          uni.showModal({
            title: '重建成功',
            content: msg,
            showCancel: false
          });
        } else {
          uni.showToast({
            title: res.message || '重建失败',
            icon: 'none'
          });
        }
        
      } catch (error) {
        console.error('重建失败:', error);
        uni.showToast({
          title: '重建失败: ' + error.message,
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    async executeFix() {
      try {
        this.loading = true;
        this.result = null;
        
        console.log('开始执行数据库修复...');
        
        const fixObj = uniCloud.importObject('fix-all-data');
        const res = await fixObj.fix();
        
        console.log('修复完成，结果:', res);
        
        if (res.code === 0) {
          this.result = res.data;
          
          uni.showToast({
            title: '修复完成！',
            icon: 'success',
            duration: 2000
          });
          
          // 2秒后返回
          setTimeout(() => {
            uni.navigateBack();
          }, 2000);
        } else {
          uni.showToast({
            title: res.message || '修复失败',
            icon: 'none'
          });
        }
        
      } catch (error) {
        console.error('修复失败:', error);
        uni.showToast({
          title: '修复失败: ' + error.message,
          icon: 'none',
          duration: 3000
        });
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.fix-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
}

.header {
  text-align: center;
  padding: 60rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.content {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 40rpx;
}

.info-box {
  margin-bottom: 40rpx;
}

.info-text {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

.table-name {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-left: 20rpx;
  margin-bottom: 10rpx;
}

.fix-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.fix-btn[disabled] {
  opacity: 0.6;
}

.rebuild-btn {
  width: 100%;
  height: 88rpx;
  background: #FF9800;
  color: #FFFFFF;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.rebuild-btn[disabled] {
  opacity: 0.6;
}

.result-box {
  margin-top: 40rpx;
  padding: 30rpx;
  background: #F5F5F5;
  border-radius: 10rpx;
}

.result-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.result-item {
  display: block;
  font-size: 24rpx;
  color: #666666;
  line-height: 40rpx;
}
</style>
