// 用户认证云对象 - 简化版(不依赖uni-id)
'use strict';
const crypto = require('crypto');

// 密码加密
function encryptPassword(password) {
  return crypto.createHash('sha256').update(password + 'tangzai-salt').digest('hex');
}

// 生成简单token
function generateToken(userId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return crypto.createHash('sha256').update(`${userId}-${timestamp}-${random}`).digest('hex');
}

module.exports = {
  /**
   * 用户登录
   */
  async login({ mobile, password }) {
    if (!mobile || !password) {
      return { code: 400, message: '账号和密码不能为空' };
    }

    try {
      const db = uniCloud.database();
      const dbCmd = db.command;
      const encryptedPwd = encryptPassword(password);
      
      console.log('登录账号:', mobile);
      console.log('加密后密码:', encryptedPwd);
      
      // 先查找用户是否存在
      const userCheckRes = await db.collection('uni-id-users')
        .where(dbCmd.or([
          { username: mobile },
          { mobile: mobile },
          { email: mobile }
        ]))
        .get();
      
      console.log('用户查询结果数量:', userCheckRes.data ? userCheckRes.data.length : 0);
      
      if (userCheckRes.data && userCheckRes.data.length > 0) {
        const user = userCheckRes.data[0];
        console.log('找到用户:', user.username);
        console.log('数据库密码:', user.password);
        console.log('密码匹配:', user.password === encryptedPwd);
        
        if (user.password !== encryptedPwd) {
          return { code: 400, message: '账号或密码错误' };
        }
        
        // 密码正确，继续登录逻辑
        const token = generateToken(user._id);
        const tokenExpired = Date.now() + 7200000; // 2小时

        // 更新token
        await db.collection('uni-id-users')
          .doc(user._id)
          .update({ 
            token: token,
            token_expired: tokenExpired,
            last_login_date: Date.now()
          });

        return {
          code: 0,
          message: '登录成功',
          data: {
            token: token,
            tokenExpired: tokenExpired,
            userInfo: {
              _id: user._id,
              username: user.username,
              mobile: user.mobile,
              email: user.email,
              city_name: user.city_name,
              is_admin: user.is_admin || false
            }
          }
        };
      }

      return { code: 400, message: '账号不存在' };

    } catch (error) {
      console.error('登录失败:', error);
      return { code: 500, message: error.message || '登录失败' };
    }
  },

  /**
   * 用户注册
   */
  async register({ username, email, mobile, password, city_name, invitation_code }) {
    // 参数校验
    if (!username || !email || !mobile || !password || !city_name || !invitation_code) {
      return { code: 400, message: '所有字段都是必填的' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { code: 400, message: '邮箱格式不正确' };
    }

    if (!/^1[3-9]\d{9}$/.test(mobile)) {
      return { code: 400, message: '手机号格式不正确' };
    }

    if (password.length < 6) {
      return { code: 400, message: '密码至少需要6位' };
    }

    try {
      // 验证邀请码
      const correctCode = process.env.INVITATION_CODE || 'tangzai2025';
      if (invitation_code !== correctCode) {
        return { code: 400, message: '邀请口令不正确' };
      }

      const db = uniCloud.database();

      // 检查是否已存在
      const existCheck = await db.collection('uni-id-users')
        .where(db.command.or([
          { username: username },
          { email: email },
          { mobile: mobile }
        ]))
        .get();

      if (existCheck.data && existCheck.data.length > 0) {
        const exist = existCheck.data[0];
        if (exist.username === username) return { code: 400, message: '用户名已被使用' };
        if (exist.email === email) return { code: 400, message: '邮箱已被注册' };
        if (exist.mobile === mobile) return { code: 400, message: '手机号已被注册' };
      }

      // 创建用户
      const encryptedPwd = encryptPassword(password);
      const now = Date.now();
      const token = generateToken(mobile);
      const tokenExpired = now + 7200000;

      const newUser = {
        username: username,
        nickname: username,
        email: email,
        mobile: mobile,
        password: encryptedPwd,
        city_name: city_name,
        is_admin: false,
        token: token,
        token_expired: tokenExpired,
        register_date: now,
        last_login_date: now
      };

      const addRes = await db.collection('uni-id-users').add(newUser);

      return {
        code: 0,
        message: '注册成功',
        data: {
          token: token,
          tokenExpired: tokenExpired,
          user: {
            _id: addRes.id,
            username: username,
            email: email,
            mobile: mobile,
            city_name: city_name,
            is_admin: false
          }
        }
      };
    } catch (error) {
      console.error('注册失败:', error);
      return { code: 500, message: error.message || '注册失败' };
    }
  },

  /**
   * 获取城市列表
   */
  async getCities() {
    try {
      const db = uniCloud.database();
      const res = await db.collection('cities').limit(100).get();

      return {
        code: 0,
        message: '获取成功',
        data: res.data || []
      };
    } catch (error) {
      console.error('获取城市列表失败:', error);
      return { code: 500, message: error.message || '获取城市列表失败', data: [] };
    }
  }
};
