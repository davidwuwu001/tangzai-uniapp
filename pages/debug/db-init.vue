<template>
  <view class="container">
    <view class="header">
      <text class="title">智能体模型配置</text>
    </view>
    
    <view class="section">
      <text class="section-title">1. 检查模型与智能体关联</text>
      <button @click="checkRelation" :loading="loading.checkRelation" type="primary">
        一键检查
      </button>
      <view v-if="results.checkRelation" class="result">
        <text>{{ results.checkRelation }}</text>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">2. 查看所有模型</text>
      <button @click="listModels" :loading="loading.listModels" type="default">
        列出 Models
      </button>
      <view v-if="results.listModels" class="result">
        <text>{{ results.listModels }}</text>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">2.5 激活所有模型</text>
      <button @click="activateModels" :loading="loading.activateModels" type="warn">
        激活所有 Models
      </button>
      <view v-if="results.activateModels" class="result">
        <text>{{ results.activateModels }}</text>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">3. 查看所有智能体</text>
      <button @click="checkAgents" :loading="loading.checkAgents" type="default">
        列出 Agents
      </button>
      <view v-if="results.checkAgents" class="result">
        <text>{{ results.checkAgents }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: {
        checkRelation: false,
        checkAgents: false,
        listModels: false,
        activateModels: false
      },
      results: {
        checkRelation: '',
        checkAgents: '',
        listModels: '',
        activateModels: ''
      }
    };
  },
  
  methods: {
    async checkRelation() {
      this.loading.checkRelation = true;
      this.results.checkRelation = '';
      
      try {
        const res = await uniCloud.importObject('check-data').checkRelation();
        this.results.checkRelation = JSON.stringify(res.data, null, 2);
      } catch (error) {
        this.results.checkRelation = '错误: ' + error.message;
      } finally {
        this.loading.checkRelation = false;
      }
    },
    
    async listModels() {
      this.loading.listModels = true;
      this.results.listModels = '';
      
      try {
        const res = await uniCloud.importObject('check-data').checkModels();
        this.results.listModels = JSON.stringify(res.data, null, 2);
      } catch (error) {
        this.results.listModels = '错误: ' + error.message;
      } finally {
        this.loading.listModels = false;
      }
    },
    
    async activateModels() {
      this.loading.activateModels = true;
      this.results.activateModels = '';
      
      try {
        const res = await uniCloud.importObject('activate-models').activateAll();
        this.results.activateModels = JSON.stringify(res, null, 2);
        
        if (res.code === 0) {
          uni.showToast({
            title: '激活成功',
            icon: 'success'
          });
        }
      } catch (error) {
        this.results.activateModels = '错误: ' + error.message;
        uni.showToast({
          title: '激活失败',
          icon: 'error'
        });
      } finally {
        this.loading.activateModels = false;
      }
    },
    
    async checkAgents() {
      this.loading.checkAgents = true;
      this.results.checkAgents = '';
      
      try {
        const res = await uniCloud.importObject('check-data').checkAgents();
        this.results.checkAgents = JSON.stringify(res.data, null, 2);
      } catch (error) {
        this.results.checkAgents = '错误: ' + error.message;
      } finally {
        this.loading.checkAgents = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
  display: block;
}

button {
  margin-top: 20rpx;
}

.result {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
