<template>
  <view class="page-content">
    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo">
        <image class="logo-image" src="/static/icon-512x512.png" mode="aspectFit" />
      </view>
      <view class="app-name">汤仔助手</view>
      <view class="app-slogan">专业教育服务平台</view>
    </view>

    <!-- 表单卡片 -->
    <view class="form-card">
      <!-- Tab切换 -->
      <view class="tab-group">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'login' }"
          @click="switchTab('login')"
        >
          密码登录
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'sms' }"
          @click="switchTab('sms')"
        >
          验证码登录
        </view>
      </view>

      <!-- 密码登录表单 -->
      <view class="form-content" v-if="activeTab === 'login'">
        <view class="input-group">
          <text class="input-label">账号</text>
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input 
              class="form-input"
              type="text"
              v-model="identifier"
              placeholder="请输入用户名/邮箱/手机号"
            />
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">密码</text>
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input 
              class="form-input"
              type="password"
              v-model="password"
              placeholder="请输入密码"
            />
          </view>
        </view>

        <view class="form-options">
          <label class="checkbox-wrapper">
            <checkbox class="checkbox" :checked="rememberPassword" @change="onRememberChange" />
            <text>记住密码</text>
          </label>
          <text class="forgot-link" @click="handleForgotPassword">忘记密码?</text>
        </view>

        <button class="submit-btn" @click="handleLogin" :loading="loading">
          登录
        </button>

        <view class="agreement">
          登录即表示同意 <text class="link" @click="showUserAgreement">《用户协议》</text> 和 <text class="link" @click="showPrivacyPolicy">《隐私政策》</text>
        </view>
      </view>

      <!-- 验证码登录表单 -->
      <view class="form-content" v-if="activeTab === 'sms'">
        <view class="input-group">
          <text class="input-label">手机号</text>
          <view class="input-wrapper">
            <text class="input-icon">📱</text>
            <input 
              class="form-input"
              type="number"
              v-model="smsPhone"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">验证码</text>
          <view class="code-input-group">
            <view class="input-wrapper">
              <text class="input-icon">🔐</text>
              <input 
                class="form-input"
                type="number"
                v-model="smsCode"
                placeholder="请输入验证码"
                maxlength="6"
              />
            </view>
            <button 
              class="send-code-btn" 
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
            </button>
          </view>
        </view>

        <button class="submit-btn" style="margin-top: 56rpx;" @click="handleSmsLogin" :loading="loading">
          登录
        </button>

        <view class="agreement">
          登录即表示同意 <text class="link" @click="showUserAgreement">《用户协议》</text> 和 <text class="link" @click="showPrivacyPolicy">《隐私政策》</text>
        </view>
      </view>

      <!-- 第三方登录 -->
      <view class="divider">
        <view class="divider-text">其他登录方式</view>
      </view>

      <view class="social-login">
        <view class="social-btn" @click="handleAppleLogin">
          <text>🍎</text>
        </view>
        <view class="social-btn" @click="handleWechatLogin">
          <text>💬</text>
        </view>
      </view>

      <view class="register-hint">
        还没有账号? <text class="register-link" @click="goRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script>
// 导入API
import { login as loginAPI } from '@/api/auth'

export default {
  data() {
    return {
      activeTab: 'login', // 当前激活的Tab: 'login' 或 'sms'
      identifier: '', // 账号标识（用户名/邮箱/手机号）
      password: '', // 密码
      rememberPassword: false, // 记住密码
      smsPhone: '', // 手机号（验证码登录）
      smsCode: '', // 验证码
      countdown: 0, // 倒计时
      timer: null, // 定时器
      loading: false // 登录加载状态
    }
  },
  
  // 组件加载时检查是否已登录
  onLoad() {
    this.checkAutoLogin()
  },
  
  // 组件卸载时清除定时器
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
    // 切换Tab
    switchTab(type) {
      this.activeTab = type
    },
    
    // 记住密码选择变更
    onRememberChange(e) {
      this.rememberPassword = e.detail.value.length > 0
    },
    
    // 检查自动登录
    checkAutoLogin() {
      const token = uni.getStorageSync('auth_token')
      const userInfo = uni.getStorageSync('user_info')
      
      // 如果已有token和用户信息，自动跳转首页
      if (token && userInfo) {
        console.log('检测到已登录，自动跳转首页')
        uni.switchTab({
          url: '/pages/workbench/workbench'
        })
      }
    },
    
    // 处理密码登录
    async handleLogin() {
      // 验证账号
      if (!this.identifier) {
        uni.showToast({
          title: '请输入账号',
          icon: 'none'
        })
        return
      }
      
      // 验证密码
      if (!this.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }

      // 显示加载状态
      this.loading = true
      
      try {
        console.log('开始登录，账号:', this.identifier)
        const res = await loginAPI(this.identifier, this.password)
        console.log('登录响应数据:', res)
        
        // 检查登录是否成功
        if (res.code !== 0) {
          uni.showToast({
            title: res.message || '登录失败',
            icon: 'none'
          })
          return
        }
        
        // 保存token
        if (res.data && res.data.token) {
          // 使用 uniCloud 标准的 token 存储key
          uni.setStorageSync('uni_id_token', res.data.token)
          uni.setStorageSync('uni_id_token_expired', res.data.tokenExpired)
          // 也保存一份到 auth_token 以兼容
          uni.setStorageSync('auth_token', res.data.token)
          console.log('Token已保存:', res.data.token)
        }
        
        // 保存用户信息
        if (res.data && res.data.userInfo) {
          uni.setStorageSync('user_info', JSON.stringify(res.data.userInfo))
          console.log('用户信息已保存:', res.data.userInfo)
        }
        
        // 如果记住密码，保存到本地
        if (this.rememberPassword) {
          uni.setStorageSync('saved_identifier', this.identifier)
          uni.setStorageSync('saved_password', this.password)
        } else {
          uni.removeStorageSync('saved_identifier')
          uni.removeStorageSync('saved_password')
        }
        
        // 显示成功提示
        uni.showToast({
          title: '登录成功！',
          icon: 'success',
          duration: 1500
        })
        
        // 跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/workbench/workbench'
          })
        }, 1500)
        
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 处理验证码登录
    async handleSmsLogin() {
      // 验证手机号
      if (!this.smsPhone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.smsPhone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      // 验证验证码
      if (!this.smsCode) {
        uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        })
        return
      }
      
      if (this.smsCode.length !== 6) {
        uni.showToast({
          title: '请输入6位验证码',
          icon: 'none'
        })
        return
      }
      
      // TODO: 调用验证码登录API
      uni.showToast({
        title: '验证码登录功能开发中',
        icon: 'none'
      })
    },
    
    // 发送验证码
    sendCode() {
      // 验证手机号
      if (!this.smsPhone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.smsPhone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      // 开始倒计时
      this.countdown = 60
      
      this.timer = setInterval(() => {
        this.countdown--
        
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
      
      // TODO: 调用发送验证码API
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
    },
    
    // 忘记密码
    handleForgotPassword() {
      uni.showToast({
        title: '忘记密码功能开发中',
        icon: 'none'
      })
    },
    
    // 显示用户协议
    showUserAgreement() {
      uni.showToast({
        title: '查看用户协议',
        icon: 'none'
      })
    },
    
    // 显示隐私政策
    showPrivacyPolicy() {
      uni.showToast({
        title: '查看隐私政策',
        icon: 'none'
      })
    },
    
    // Apple登录
    handleAppleLogin() {
      uni.showToast({
        title: 'Apple登录功能开发中',
        icon: 'none'
      })
    },
    
    // 微信登录
    handleWechatLogin() {
      uni.showToast({
        title: '微信登录功能开发中',
        icon: 'none'
      })
    },

    // 跳转注册
    goRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    }
  }
}
</script>

<style scoped>
/* 内容区域 */
.page-content {
  min-height: 100vh;
  background: linear-gradient(135deg, #4C12A1 0%, #C964CF 100%);
  position: relative;
}

/* Logo区域 */
.logo-section {
  padding: 120rpx 80rpx 80rpx;
  text-align: center;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40rpx;
  backdrop-filter: blur(20rpx);
}

.logo-emoji {
  font-size: 120rpx;
}

.app-name {
  font-size: 64rpx;
  font-weight: 700;
  color: white;
  margin-bottom: 16rpx;
  text-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.app-slogan {
  font-size: 30rpx;
  color: rgba(255,255,255,0.9);
  font-weight: 500;
}

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 48rpx 48rpx 0 0;
  padding: 80rpx 56rpx 56rpx;
  min-height: calc(100vh - 600rpx);
}

/* Tab切换 */
.tab-group {
  display: flex;
  gap: 64rpx;
  margin-bottom: 64rpx;
  border-bottom: 4rpx solid #F5F5F5;
}

.tab-item {
  font-size: 36rpx;
  font-weight: 600;
  color: #999999;
  padding-bottom: 24rpx;
  position: relative;
  transition: color 0.3s;
}

.tab-item.active {
  color: #4C12A1;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -4rpx;
  left: 0;
  right: 0;
  height: 4rpx;
  background: #4C12A1;
}

/* 表单内容 */
.form-content {
  display: block;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
  display: block;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.input-icon {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40rpx;
  color: #999999;
  z-index: 1;
}

.form-input {
  width: 100%;
  height: 104rpx;
  padding: 0 32rpx 0 100rpx;
  border: 2rpx solid #EEEEEE;
  border-radius: 24rpx;
  font-size: 30rpx;
  color: #333333;
  background: #F8F8F8;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #4C12A1;
  background: white;
}

/* 验证码输入 */
.code-input-group {
  display: flex;
  gap: 24rpx;
}

.code-input-group .input-wrapper {
  flex: 1;
}

.send-code-btn {
  flex-shrink: 0;
  height: 104rpx;
  padding: 0 40rpx;
  background: rgba(76, 18, 161, 0.12);
  color: #4C12A1;
  border: none;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  white-space: nowrap;
  line-height: 104rpx;
}

.send-code-btn::after {
  border: none;
}

.send-code-btn[disabled] {
  opacity: 0.5;
}

/* 记住密码 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
  font-size: 28rpx;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
  color: #666666;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  transform: scale(0.7);
}

.forgot-link {
  color: #4C12A1;
  font-weight: 500;
}

/* 登录按钮 */
.submit-btn {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  color: white;
  border: none;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 40rpx;
  line-height: 104rpx;
}

.submit-btn::after {
  border: none;
}

/* 第三方登录 */
.divider {
  display: flex;
  align-items: center;
  margin: 56rpx 0;
  color: #999999;
  font-size: 26rpx;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 2rpx;
  background: #EEEEEE;
}

.divider-text {
  padding: 0 32rpx;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 48rpx;
}

.social-btn {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  border: 2rpx solid #EEEEEE;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

/* 注册提示 */
.register-hint {
  text-align: center;
  margin-top: 48rpx;
  font-size: 28rpx;
  color: #666666;
}

.register-link {
  color: #4C12A1;
  font-weight: 600;
}

/* 协议提示 */
.agreement {
  margin-top: 40rpx;
  text-align: center;
  font-size: 24rpx;
  color: #999999;
  line-height: 36rpx;
}

.agreement .link {
  color: #4C12A1;
}
</style>
