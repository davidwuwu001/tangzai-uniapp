// 用户认证云对象
// 用途：处理用户登录、注册、个人信息管理
'use strict';

// 获取当前登录用户信息
async function getCurrentUser(token) {
  if (!token) {
    throw new Error('未登录或登录已过期');
  }
  const uniID = uniCloud.uniID();
  const res = await uniID.checkToken(token);
  if (res.code) {
    throw new Error('token已过期');
  }
  const db = uniCloud.database();
  const userRes = await db.collection('uni-id-users')
    .doc(res.uid)
    .field({ _id: true, username: true, mobile: true, email: true, city_name: true, department_name: true, is_admin: true, avatar: true })
    .get();
  if (!userRes.data || userRes.data.length === 0) {
    throw new Error('用户不存在');
  }
  return userRes.data[0];
}

module.exports = {
  _before: function() {
    // 前置拦截器 - 在所有方法执行前调用
    this.startTime = Date.now();
  },

  _after: function(error, result) {
    // 后置拦截器
    if (error) {
      console.error('云对象执行错误:', error);
      throw error;
    }
    return result;
  },

  /**
   * 用户登录
   * @param {string} mobile - 手机号
   * @param {string} password - 密码
   */
  async login({ mobile, password }) {
    if (!mobile || !password) {
      return {
        code: 400,
        message: '手机号和密码不能为空'
      };
    }

    try {
      const uniIDIns = uniCloud.uniID();
      
      // 使用 uni-id 登录
      const loginRes = await uniIDIns.login({
        mobile,
        password
      });

      if (loginRes.errCode) {
        return {
          code: loginRes.errCode,
          message: loginRes.errMsg
        };
      }

      // 获取用户完整信息
      const db = uniCloud.database();
      const userRes = await db.collection('uni-id-users')
        .doc(loginRes.uid)
        .field({
          _id: true,
          username: true,
          mobile: true,
          city: true,
          city_name: true,
          department: true,
          is_admin: true,
          avatar: true
        })
        .get();

      return {
        code: 0,
        message: '登录成功',
        data: {
          token: loginRes.token,
          tokenExpired: loginRes.tokenExpired,
          userInfo: userRes.data[0]
        }
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        code: 500,
        message: error.message || '登录失败'
      };
    }
  },

  /**
   * 用户注册
   * @param {string} username - 用户姓名
   * @param {string} email - 邮箱
   * @param {string} mobile - 手机号
   * @param {string} password - 密码
   * @param {string} city_name - 城市名称
   * @param {string} invitation_code - 邀请口令
   */
  async register({ username, email, mobile, password, city_name, invitation_code }) {
    // 参数校验
    if (!username || !email || !mobile || !password || !city_name || !invitation_code) {
      return {
        code: 400,
        message: '所有字段都是必填的'
      };
    }

    // 邮箱格式验证
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { code: 400, message: '邮箱格式不正确' };
    }

    // 手机号格式验证
    if (!/^1[3-9]\d{9}$/.test(mobile)) {
      return { code: 400, message: '手机号格式不正确' };
    }

    // 密码长度验证
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

      // 检查用户名是否已存在
      const existUserRes = await db.collection('uni-id-users')
        .where({ username })
        .count();

      if (existUserRes.total > 0) {
        return { code: 400, message: '用户名已被使用' };
      }

      // 检查邮箱是否已存在
      const existEmailRes = await db.collection('uni-id-users')
        .where({ email })
        .count();

      if (existEmailRes.total > 0) {
        return { code: 400, message: '邮箱已被注册' };
      }

      // 检查手机号是否已存在
      const existMobileRes = await db.collection('uni-id-users')
        .where({ mobile })
        .count();

      if (existMobileRes.total > 0) {
        return { code: 400, message: '手机号已被注册' };
      }

      const uniIDIns = uniCloud.uniID();

      // 使用 uni-id 注册
      const registerRes = await uniIDIns.register({
        username,
        email,
        mobile,
        password,
        nickname: username
      });

      if (registerRes.errCode) {
        return {
          code: registerRes.errCode,
          message: registerRes.errMsg || '注册失败'
        };
      }

      // 更新用户附加信息
      await db.collection('uni-id-users')
        .doc(registerRes.uid)
        .update({
          city_name,
          is_admin: false
        });

      // 自动登录获取 token
      const loginRes = await uniIDIns.login({
        mobile,
        password
      });

      return {
        code: 0,
        message: '注册成功',
        data: {
          token: loginRes.token,
          tokenExpired: loginRes.tokenExpired,
          user: {
            _id: registerRes.uid,
            username,
            email,
            mobile,
            city_name,
            is_admin: false
          }
        }
      };
    } catch (error) {
      console.error('注册失败:', error);
      return {
        code: 500,
        message: error.message || '注册失败'
      };
    }
  },

  /**
   * 获取当前用户信息
   */
  async getUserInfo() {
    try {
      const user = await getCurrentUser(this.getClientInfo());
      
      return {
        code: 0,
        data: user
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return {
        code: 401,
        message: error.message || '请先登录'
      };
    }
  },

  /**
   * 更新用户信息
   * @param {object} userInfo - 要更新的用户信息
   */
  async updateUserInfo(userInfo) {
    try {
      const user = await getCurrentUser(this.getClientInfo());
      
      const db = uniCloud.database();
      
      // 只允许更新部分字段
      const allowedFields = ['username', 'avatar', 'city_name'];
      const updateData = {};
      
      for (const key of allowedFields) {
        if (userInfo[key] !== undefined) {
          updateData[key] = userInfo[key];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return {
          code: 400,
          message: '没有可更新的字段'
        };
      }

      await db.collection('uni-id-users')
        .doc(user._id)
        .update(updateData);

      return {
        code: 0,
        message: '更新成功'
      };
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return {
        code: 500,
        message: error.message || '更新失败'
      };
    }
  },

  /**
   * 修改密码
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   */
  async changePassword({ oldPassword, newPassword }) {
    if (!oldPassword || !newPassword) {
      return {
        code: 400,
        message: '旧密码和新密码不能为空'
      };
    }

    try {
      const uniIDIns = uniCloud.uniID();
      
      const res = await uniIDIns.updatePwd({
        oldPassword,
        newPassword
      });

      if (res.errCode) {
        return {
          code: res.errCode,
          message: res.errMsg
        };
      }

      return {
        code: 0,
        message: '密码修改成功'
      };
    } catch (error) {
      console.error('修改密码失败:', error);
      return {
        code: 500,
        message: error.message || '修改密码失败'
      };
    }
  },

  /**
   * 退出登录
   */
  async logout() {
    try {
      const uniIDIns = uniCloud.uniID();
      await uniIDIns.logout();

      return {
        code: 0,
        message: '退出成功'
      };
    } catch (error) {
      console.error('退出登录失败:', error);
      return {
        code: 500,
        message: error.message || '退出失败'
      };
    }
  }
};
