<template>
  <view class="chat-page">
    <!-- 头部导航 -->
    <view class="chat-header">
      <view class="header-content">
        <view class="header-left">
          <view class="back-btn-wrapper" @click="goBack">
            <view class="back-btn">
              <text>←</text>
            </view>
          </view>
          <view class="agent-info">
            <text class="agent-name">{{ agentInfo.name }}</text>
            <text class="agent-desc">{{ agentInfo.desc }}</text>
          </view>
        </view>
        <view class="header-actions">
          <view class="action-btn" @click="viewHistory">
            <text>📋</text>
          </view>
          <view class="action-btn" @click="newChat">
            <text>✨</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 消息区域 -->
    <scroll-view 
      class="messages-container" 
      scroll-y
      :scroll-into-view="scrollIntoView"
      :scroll-with-animation="true"
    >
      <!-- 空状态 -->
      <view v-if="messages.length === 0" class="empty-state">
        <view class="empty-icon">
          <text>{{ agentInfo.icon }}</text>
        </view>
        <text class="empty-title">开始与{{ agentInfo.name }}对话</text>
        <text class="empty-desc">{{ agentInfo.desc }}</text>
        <view class="quick-questions">
          <view 
            v-for="(question, index) in quickQuestions" 
            :key="index"
            class="quick-question"
            @click="sendQuickQuestion(question)"
          >
            <text>{{ question }}</text>
          </view>
        </view>
      </view>
      
      <!-- 消息列表 -->
      <view v-else class="messages-list">
        <view 
          v-for="(message, index) in messages" 
          :key="index"
          :id="'msg-' + index"
          class="message"
          :class="message.role"
        >
          <view class="avatar" :class="message.role">
            <text v-if="message.role === 'assistant'">{{ agentInfo.icon }}</text>
            <text v-else>👤</text>
          </view>
          <view class="message-content">
            <view class="message-bubble">
              <view v-if="message.role === 'assistant'" class="markdown-content" v-html="formatMarkdown(message.content)"></view>
              <text v-else>{{ message.content }}</text>
            </view>
            <view class="message-meta">
              <text>{{ formatTime(message.timestamp) }}</text>
              <text v-if="message.role === 'assistant'" class="copy-btn" @click="copyMessage(message.content)">
                复制
              </text>
            </view>
          </view>
        </view>
        
        <!-- AI 思考中动画 -->
        <view v-if="isLoading" class="message assistant">
          <view class="avatar assistant">
            <text>{{ agentInfo.icon }}</text>
          </view>
          <view class="message-content">
            <view class="message-bubble">
              <view class="typing-indicator">
                <view class="typing-dot"></view>
                <view class="typing-dot"></view>
                <view class="typing-dot"></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 输入区域 -->
    <view class="input-container">
      <view class="input-wrapper">
        <view class="input-box">
          <textarea 
            class="input-field"
            v-model="inputText"
            placeholder="输入消息..."
            :maxlength="500"
            :auto-height="false"
            :show-confirm-bar="false"
          />
          <view v-if="inputText" class="clear-btn" @click="clearInput">
            <text>×</text>
          </view>
        </view>
        <view 
          class="send-btn" 
          :class="{ disabled: !canSend }"
          @click="sendMessage"
        >
          <text class="send-icon">➤</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import chatData from '@/mock/chat.js';
import { marked } from 'marked';

// 配置 marked
marked.setOptions({
  breaks: true,  // 支持 GitHub 风格换行
  gfm: true      // 启用 GitHub Flavored Markdown
});

export default {
  data() {
    return {
      agentInfo: {
        name: '教学助手',
        desc: '辅助备课与教学',
        icon: '👩‍🏫',
        type: 'teaching',
        agentId: '' // 智能体ID
      },
      quickQuestions: [],
      messages: [],
      inputText: '',
      isLoading: false,
      scrollIntoView: ''
    };
  },
  
  computed: {
    canSend() {
      return this.inputText.trim().length > 0 && !this.isLoading;
    }
  },
  
  onLoad(options) {
    // 从路由参数获取智能体信息
    if (options.agentName) {
      this.agentInfo.name = decodeURIComponent(options.agentName);
    }
    if (options.agentDesc) {
      this.agentInfo.desc = decodeURIComponent(options.agentDesc);
    }
    if (options.agentIcon) {
      this.agentInfo.icon = decodeURIComponent(options.agentIcon);
    }
    if (options.agentType) {
      this.agentInfo.type = options.agentType;
    }
    if (options.agentId) {
      this.agentInfo.agentId = options.agentId;
    }
    
    // 加载快捷问题
    this.quickQuestions = chatData.getQuickQuestions(this.agentInfo.type);
  },
  
  methods: {
    goBack() {
      console.log('返回按钮被点击');
      // 尝试返回上一页
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        // 如果是直接访问的页面，直接跳转到智能体列表
        uni.reLaunch({
          url: '/pages/teaching/teaching'
        });
      }
    },
    
    viewHistory() {
      uni.navigateTo({
        url: '/pages/chat/history'
      });
    },
    
    newChat() {
      uni.showModal({
        title: '新建对话',
        content: '确定要开始新的对话吗?当前对话将被清空。',
        success: (res) => {
          if (res.confirm) {
            this.messages = [];
            this.inputText = '';
          }
        }
      });
    },
    
    sendQuickQuestion(question) {
      this.inputText = question;
      this.sendMessage();
    },
    
    async sendMessage() {
      if (!this.canSend) return;
      
      const userMessage = this.inputText.trim();
      if (!userMessage) return;
      
      this.inputText = '';
      
      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      this.isLoading = true;
      
      // 设置超时处理（120秒，适合火山引擎长内容生成）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时，请重试或简化问题')), 120000);
      });
      
      try {
        // 使用云对象调用（非流式）
        const chat = uniCloud.importObject('chat');
        const chatPromise = chat.sendMessage({
          agent_id: this.agentInfo.agentId,
          messages: this.messages.slice(-10) // 最近10轮对话
        });
        
        // 竞争：正常请求 vs 超时
        const res = await Promise.race([chatPromise, timeoutPromise]);
        
        if (res.code === 0) {
          // 添加 AI 回复
          this.messages.push({
            role: 'assistant',
            content: res.data.response,
            timestamp: new Date().toISOString()
          });
          
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else {
          throw new Error(res.message || '请求失败');
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        
        // 显示错误消息
        let errorMsg = '发送失败,请重试';
        if (error.message) {
          if (error.message.includes('超时')) {
            errorMsg = '请求超时，请简化问题或稍后重试';
          } else if (error.message.includes('网络')) {
            errorMsg = '网络异常，请检查网络连接';
          } else {
            errorMsg = error.message;
          }
        }
        
        uni.showModal({
          title: '请求失败',
          content: errorMsg,
          showCancel: false,
          confirmText: '知道了'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    clearInput() {
      this.inputText = '';
    },
    
    scrollToBottom() {
      if (this.messages.length > 0) {
        this.scrollIntoView = 'msg-' + (this.messages.length - 1);
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    
    copyMessage(content) {
      uni.setClipboardData({
        data: content,
        success: () => {
          uni.showToast({
            title: '已复制',
            icon: 'success'
          });
        }
      });
    },
    
    formatMarkdown(text) {
      if (!text) return '';
      
      try {
        // 使用 marked 解析 Markdown
        const html = marked.parse(text);
        return html;
      } catch (error) {
        console.error('Markdown 解析错误:', error);
        // 如果解析失败，返回原文本
        return text.replace(/\n/g, '<br>');
      }
    }
  }
};
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8F8F8;
}

/* 头部导航 */
.chat-header {
  background: linear-gradient(135deg, rgba(76, 18, 161, 0.08), rgba(201, 100, 207, 0.08));
  padding: 24rpx 32rpx 28rpx;
  border-bottom: 2rpx solid rgba(76, 18, 161, 0.1);
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
}

.back-btn-wrapper {
  padding: 8rpx;
  cursor: pointer;
  z-index: 1000;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  z-index: 999;
  flex-shrink: 0;
}

.back-btn:active {
  transform: scale(0.95);
  background-color: #F5F5F5;
}

.back-btn:hover {
  background-color: #F0F0F0;
}

.agent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.agent-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.agent-desc {
  font-size: 24rpx;
  color: #999999;
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  transition: all 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
  background-color: #F5F5F5;
}

/* 消息区域 */
.messages-container {
  flex: 1;
  padding: 32rpx;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(76, 18, 161, 0.3);
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
  margin-bottom: 40rpx;
}

.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
  max-width: 560rpx;
}

.quick-question {
  padding: 24rpx 32rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #666666;
  text-align: left;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.quick-question:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 消息 */
.message {
  display: flex;
  gap: 24rpx;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 600;
}

.avatar.assistant {
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  color: #FFFFFF;
}

.avatar.user {
  background: linear-gradient(135deg, #FC4C02, #FFA300);
  color: #FFFFFF;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 24rpx 32rpx;
  border-radius: 32rpx;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.assistant .message-bubble {
  background-color: #FFFFFF;
  color: #333333;
  border-bottom-left-radius: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  color: #FFFFFF;
  border-bottom-right-radius: 8rpx;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #999999;
  padding: 0 8rpx;
}

.message.user .message-meta {
  justify-content: flex-end;
}

.copy-btn {
  color: #4C12A1;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  transition: all 0.2s;
}

.copy-btn:active {
  background-color: rgba(76, 18, 161, 0.1);
}

/* 加载动画 */
.typing-indicator {
  display: flex;
  gap: 12rpx;
}

.typing-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #CCCCCC;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-20rpx);
  }
}

/* 输入区域 */
.input-container {
  background-color: #FFFFFF;
  border-top: 2rpx solid #EEEEEE;
  padding: 24rpx 32rpx;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.input-box {
  flex: 1;
  position: relative;
}

.input-field {
  width: 100%;
  height: 80rpx;
  padding: 20rpx 80rpx 20rpx 32rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #F8F8F8;
  transition: border 0.3s;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #4C12A1;
  background-color: #FFFFFF;
}

.clear-btn {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #CCCCCC;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #FFFFFF;
}

.send-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  display: flex !important;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  visibility: visible !important;
}

.send-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.send-btn:not(.disabled):active {
  transform: scale(0.9);
}

.send-icon {
  font-size: 36rpx;
  color: #FFFFFF;
}

/* Markdown 样式 */
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
}

.markdown-content h1 {
  font-size: 36rpx;
  font-weight: bold;
  margin: 20rpx 0 16rpx;
  color: #1a1a1a;
}

.markdown-content h2 {
  font-size: 32rpx;
  font-weight: bold;
  margin: 16rpx 0 12rpx;
  color: #1a1a1a;
}

.markdown-content h3 {
  font-size: 30rpx;
  font-weight: bold;
  margin: 12rpx 0 8rpx;
  color: #1a1a1a;
}

.markdown-content strong {
  font-weight: bold;
  color: #1a1a1a;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content code.inline-code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  font-family: 'Courier New', monospace;
  font-size: 26rpx;
  color: #d73a49;
}

.markdown-content pre.code-block {
  background-color: #f6f8fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin: 16rpx 0;
  overflow-x: auto;
}

.markdown-content pre.code-block code {
  font-family: 'Courier New', monospace;
  font-size: 26rpx;
  line-height: 1.5;
  color: #24292e;
  white-space: pre;
}

.markdown-content ul {
  margin: 12rpx 0;
  padding-left: 40rpx;
}

.markdown-content ol {
  margin: 12rpx 0;
  padding-left: 40rpx;
}

.markdown-content li {
  margin: 8rpx 0;
  line-height: 1.6;
}
</style>
