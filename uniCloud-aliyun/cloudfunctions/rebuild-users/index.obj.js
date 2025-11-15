// 重建用户数据
'use strict';
const crypto = require('crypto');

// 密码加密
function encryptPassword(password) {
  return crypto.createHash('sha256').update(password + 'tangzai-salt').digest('hex');
}

module.exports = {
  async rebuild() {
    try {
      const db = uniCloud.database();
      const usersCollection = db.collection('uni-id-users');
      
      // 检查是否已有用户
      const existingUsers = await usersCollection.count();
      if (existingUsers.total > 0) {
        return {
          code: 0,
          message: `已存在 ${existingUsers.total} 个用户，跳过重建`
        };
      }
      
      // 创建默认用户：吴世健
      const now = Date.now();
      const defaultUser = {
        username: '吴世健',
        nickname: '吴世健',
        mobile: '18240413895',
        email: '779695947@qq.com',
        password: encryptPassword('123456'), // 默认密码
        city_name: '平台',
        department_name: '',
        is_admin: false,
        register_date: now,
        last_login_date: now,
        token: '',
        token_expired: 0
      };
      
      const result = await usersCollection.add(defaultUser);
      
      return {
        code: 0,
        message: '用户重建成功',
        data: {
          userId: result.id,
          username: '吴世健',
          mobile: '18240413895',
          defaultPassword: '123456',
          note: '请使用手机号18240413895和密码123456登录'
        }
      };
      
    } catch (error) {
      console.error('重建用户失败:', error);
      return {
        code: 500,
        message: error.message || '重建用户失败'
      };
    }
  }
};
