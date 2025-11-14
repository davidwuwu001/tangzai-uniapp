<template>
  <view class="page-content">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <view class="header-title">创建账户</view>
    </view>

    <!-- 表单区域 -->
    <view class="form-container">
      <view class="form-title">欢迎加入汤仔助手</view>
      <view class="form-subtitle">填写以下信息完成注册</view>

      <!-- 姓名 -->
      <view class="input-group">
        <text class="input-label">姓名 <text class="required">*</text></text>
        <view class="input-wrapper">
          <text class="input-icon">👤</text>
          <input 
            class="form-input"
            type="text"
            v-model="formData.username"
            placeholder="请输入真实姓名"
          />
        </view>
      </view>

      <!-- 邮箱 -->
      <view class="input-group">
        <text class="input-label">邮箱 <text class="required">*</text></text>
        <view class="input-wrapper">
          <text class="input-icon">📧</text>
          <input 
            class="form-input"
            type="text"
            v-model="formData.email"
            placeholder="请输入邮箱地址"
          />
        </view>
      </view>

      <!-- 手机号 -->
      <view class="input-group">
        <text class="input-label">手机号 <text class="required">*</text></text>
        <view class="input-wrapper">
          <text class="input-icon">📱</text>
          <input 
            class="form-input"
            type="number"
            v-model="formData.phone"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>
      </view>

      <!-- 城市选择 -->
      <view class="input-group">
        <text class="input-label">城市 <text class="required">*</text></text>
        <view class="input-wrapper">
          <text class="input-icon">📍</text>
          <picker 
            mode="selector" 
            :range="cities" 
            range-key="name"
            @change="onCityChange"
          >
            <view class="form-input picker-input">
              {{ formData.cityName || '请选择城市' }}
            </view>
          </picker>
        </view>
      </view>

      <!-- 邀请口令 -->
      <view class="input-group">
        <text class="input-label">邀请口令 <text class="required">*</text></text>
        <view class="input-wrapper">
          <text class="input-icon">🔑</text>
          <input 
            class="form-input"
            type="text"
            v-model="formData.invitationCode"
            placeholder="请输入邀请口令"
          />
        </view>
      </view>

      <!-- 密码 -->
      <view class="input-group">
        <text class="input-label">密码 <text class="required">*</text></text>
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input 
            class="form-input"
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.password"
            placeholder="请输入密码（至少6位）"
          />
          <text class="eye-icon" @click="togglePassword">
            {{ showPassword ? '👁️' : '🙈' }}
          </text>
        </view>
      </view>

      <!-- 确认密码 -->
      <view class="input-group">
        <text class="input-label">确认密码 <text class="required">*</text></text>
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input 
            class="form-input"
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.confirmPassword"
            placeholder="请再次输入密码"
          />
        </view>
      </view>

      <!-- 注册按钮 -->
      <button class="submit-btn" @click="handleRegister" :loading="loading">
        注册
      </button>

      <!-- 已有账户 -->
      <view class="login-hint">
        已有账户？<text class="login-link" @click="goLogin">立即登录</text>
      </view>

      <!-- 协议 -->
      <view class="agreement">
        注册即表示同意 <text class="link">《用户协议》</text> 和 <text class="link">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        username: '',
        email: '',
        phone: '',
        city: '',
        cityName: '',
        invitationCode: '',
        password: '',
        confirmPassword: ''
      },
      cities: [],
      showPassword: false,
      loading: false
    }
  },

  onLoad() {
    this.fetchCities()
  },

  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },

    // 获取城市列表
    async fetchCities() {
      try {
        const db = uniCloud.database()
        const res = await db.collection('cities').get()
        this.cities = res.data || []
      } catch (error) {
        console.error('获取城市列表失败:', error)
        uni.showToast({
          title: '获取城市列表失败',
          icon: 'none'
        })
      }
    },

    // 城市选择变化
    onCityChange(e) {
      const index = e.detail.value
      this.formData.city = this.cities[index]._id
      this.formData.cityName = this.cities[index].name
    },

    // 切换密码显示
    togglePassword() {
      this.showPassword = !this.showPassword
    },

    // 表单验证
    validateForm() {
      const { username, email, phone, city, invitationCode, password, confirmPassword } = this.formData

      if (!username.trim()) {
        uni.showToast({ title: '请输入姓名', icon: 'none' })
        return false
      }

      if (!email.trim()) {
        uni.showToast({ title: '请输入邮箱', icon: 'none' })
        return false
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        uni.showToast({ title: '请输入有效的邮箱地址', icon: 'none' })
        return false
      }

      if (!phone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return false
      }

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        uni.showToast({ title: '请输入有效的手机号', icon: 'none' })
        return false
      }

      if (!city) {
        uni.showToast({ title: '请选择城市', icon: 'none' })
        return false
      }

      if (!invitationCode) {
        uni.showToast({ title: '请输入邀请口令', icon: 'none' })
        return false
      }

      if (!password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return false
      }

      if (password.length < 6) {
        uni.showToast({ title: '密码至少需要6位', icon: 'none' })
        return false
      }

      if (password !== confirmPassword) {
        uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
        return false
      }

      return true
    },

    // 处理注册
    async handleRegister() {
      if (!this.validateForm()) return

      this.loading = true

      try {
        const userObj = uniCloud.importObject('user')
        const res = await userObj.register({
          username: this.formData.username,
          email: this.formData.email,
          mobile: this.formData.phone,
          password: this.formData.password,
          city_name: this.formData.cityName,
          invitation_code: this.formData.invitationCode
        })

        if (res.code === 0) {
          uni.showToast({
            title: '注册成功！',
            icon: 'success'
          })

          // 保存 token 和用户信息
          if (res.data.token) {
            uni.setStorageSync('auth_token', res.data.token)
          }
          if (res.data.user) {
            uni.setStorageSync('user_info', JSON.stringify(res.data.user))
          }

          // 跳转到首页
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/teaching/teaching'
            })
          }, 1500)
        } else {
          throw new Error(res.message || '注册失败')
        }
      } catch (error) {
        console.error('注册失败:', error)
        uni.showToast({
          title: error.message || '注册失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 跳转登录
    goLogin() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page-content {
  min-height: 100vh;
  background: linear-gradient(135deg, #4C12A1 0%, #C964CF 100%);
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  padding: 32rpx;
  position: relative;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: white;
  backdrop-filter: blur(20rpx);
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36rpx;
  font-weight: 600;
  color: white;
}

/* 表单容器 */
.form-container {
  background: white;
  border-radius: 48rpx 48rpx 0 0;
  padding: 64rpx 48rpx;
  margin-top: 32rpx;
  min-height: calc(100vh - 200rpx);
}

.form-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 16rpx;
}

.form-subtitle {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 56rpx;
}

/* 输入框组 */
.input-group {
  margin-bottom: 40rpx;
}

.input-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.required {
  color: #F56C6C;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40rpx;
  z-index: 1;
}

.form-input {
  width: 100%;
  height: 104rpx;
  padding: 0 32rpx 0 100rpx;
  border: 2rpx solid #EEEEEE;
  border-radius: 24rpx;
  font-size: 30rpx;
  color: #333;
  background: #F8F8F8;
  box-sizing: border-box;
}

.picker-input {
  display: flex;
  align-items: center;
  line-height: 104rpx;
}

.form-input:focus {
  border-color: #4C12A1;
  background: white;
}

.eye-icon {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40rpx;
  padding: 16rpx;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(135deg, #4C12A1, #C964CF);
  color: white;
  border: none;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 56rpx;
  margin-bottom: 32rpx;
  line-height: 104rpx;
}

.submit-btn::after {
  border: none;
}

/* 登录提示 */
.login-hint {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 32rpx;
}

.login-link {
  color: #4C12A1;
  font-weight: 600;
}

/* 协议 */
.agreement {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  line-height: 36rpx;
}

.agreement .link {
  color: #4C12A1;
}
</style>
