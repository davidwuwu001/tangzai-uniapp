/**
 * 测试导入云函数 - 返回详细错误信息
 */

const db = uniCloud.database();

module.exports = {
  /**
   * 测试单条插入
   */
  async testSingle() {
    const collection = db.collection('uni-id-users');
    
    // 测试最简单的数据
    const testUser = {
      username: "测试用户" + Date.now(),
      mobile: "13800138000",
      nickname: "测试"
    };
    
    try {
      const res = await collection.add(testUser);
      return {
        success: true,
        message: "单条插入成功",
        id: res.id,
        inserted: res.inserted
      };
    } catch (e) {
      return {
        success: false,
        message: "单条插入失败",
        error: e.message,
        errorCode: e.code,
        errorDetail: JSON.stringify(e, null, 2)
      };
    }
  },
  
  /**
   * 测试带完整字段的插入
   */
  async testFull() {
    const collection = db.collection('uni-id-users');
    
    const testUser = {
      username: "完整测试" + Date.now(),
      mobile: "13800138001",
      nickname: "完整测试",
      mobile_confirmed: 0,
      password: "$2a$10$test",
      department: "伙伴",
      is_admin: false,
      role: ["user"],
      permission: [],
      token: [],
      city: 218
    };
    
    try {
      const res = await collection.add(testUser);
      return {
        success: true,
        message: "完整字段插入成功",
        id: res.id
      };
    } catch (e) {
      return {
        success: false,
        message: "完整字段插入失败",
        error: e.message,
        errorCode: e.code,
        errorDetail: JSON.stringify(e, null, 2),
        testData: testUser
      };
    }
  },
  
  /**
   * 获取当前表状态
   */
  async getTableInfo() {
    const collection = db.collection('uni-id-users');
    
    try {
      const countRes = await collection.count();
      const dataRes = await collection.limit(3).get();
      
      return {
        success: true,
        count: countRes.total,
        sampleData: dataRes.data
      };
    } catch (e) {
      return {
        success: false,
        error: e.message
      };
    }
  },
  
  /**
   * 批量插入前3条真实数据（测试）
   */
  async testRealData() {
    const collection = db.collection('uni-id-users');
    
    // 前3条真实数据
    const realUsers = [
      {
        username: "吴世健",
        mobile: "18240413895",
        nickname: "吴世健",
        department: "教研部",
        password: "$2a$10$5UE5qW.7qleLb5a88JcqjuI22jsVFReqO6BVDGMd00t9MOq5mcYKS",
        mobile_confirmed: 0,
        is_admin: false,
        role: ["user"],
        permission: [],
        token: [],
        city: 218
      },
      {
        username: "朱艳娜",
        mobile: "17717098204",
        nickname: "朱艳娜",
        department: "顾客部",
        password: "$2a$10$ze.RCSOk2K.SosdvWk5ek.p1eFD9tus0PVp.4qGq6tG6AdaocMY5O",
        mobile_confirmed: 0,
        is_admin: false,
        role: ["user"],
        permission: [],
        token: []
      },
      {
        username: "孙小敏",
        mobile: "13162051896",
        nickname: "孙小敏",
        department: "教研部",
        password: "$2a$10$81XVC.vP.dEEOefatYeXCO3i9eMSMSszRSQUCB6mLkpbQfuv/tKne",
        mobile_confirmed: 0,
        is_admin: false,
        role: ["user"],
        permission: [],
        token: []
      }
    ];
    
    try {
      const res = await collection.add(realUsers);
      return {
        success: true,
        message: "真实数据插入成功",
        inserted: res.inserted || realUsers.length
      };
    } catch (e) {
      return {
        success: false,
        message: "真实数据插入失败",
        error: e.message,
        errorCode: e.code,
        errorDetail: JSON.stringify(e, null, 2),
        testData: realUsers
      };
    }
  }
};
