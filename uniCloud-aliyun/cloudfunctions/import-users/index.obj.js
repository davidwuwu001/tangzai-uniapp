/**
 * 云对象：批量导入用户数据
 * 用于将 MySQL 导出的用户数据批量导入到 MongoDB
 */

const db = uniCloud.database();

module.exports = {
  _before: function() {
    // 这个函数会在所有方法调用前执行
  },

  /**
   * 批量导入用户数据
   * @param {Array} users - 用户数据数组
   * @returns {Object} 导入结果
   */
  async batchImport(users) {
    if (!users || !Array.isArray(users) || users.length === 0) {
      return {
        success: false,
        message: '用户数据为空或格式错误'
      };
    }

    const collection = db.collection('uni-id-users');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log(`开始导入 ${users.length} 条用户数据（逐条插入模式）`);
    
    // 逐条插入（避免批量插入的问题）
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        await collection.add(user);
        successCount++;
        
        // 每10条输出一次进度
        if ((i + 1) % 10 === 0) {
          console.log(`进度: ${i + 1}/${users.length} 条`);
        }
      } catch (e) {
        console.error(`第 ${i + 1} 条导入失败 (${user.username}):`, e.message);
        errorCount++;
        errors.push({
          index: i + 1,
          username: user.username,
          error: e.message
        });
      }
    }
    
    return {
      success: errorCount === 0,
      message: `导入完成：成功 ${successCount} 条，失败 ${errorCount} 条`,
      total: users.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  /**
   * 检查表中现有用户数量
   * @returns {Object} 用户统计信息
   */
  async checkExisting() {
    const collection = db.collection('uni-id-users');
    
    try {
      const countRes = await collection.count();
      const total = countRes.total;
      
      // 获取最近 5 条记录作为示例
      const listRes = await collection
        .field({ username: true, mobile: true, register_date: true })
        .orderBy('register_date', 'desc')
        .limit(5)
        .get();
      
      return {
        success: true,
        total,
        recentUsers: listRes.data
      };
    } catch (e) {
      return {
        success: false,
        message: '查询失败: ' + e.message
      };
    }
  },

  /**
   * 清空表（谨慎使用）
   * @param {String} confirmCode - 确认码，必须是 "CONFIRM_DELETE_ALL"
   * @returns {Object} 删除结果
   */
  async clearAll(confirmCode) {
    if (confirmCode !== 'CONFIRM_DELETE_ALL') {
      return {
        success: false,
        message: '确认码错误，必须输入: CONFIRM_DELETE_ALL'
      };
    }

    const collection = db.collection('uni-id-users');
    
    try {
      // 先查询总数
      const countRes = await collection.count();
      const total = countRes.total;
      
      console.log(`准备删除 ${total} 条记录...`);
      
      // 分批删除（避免超时）
      let deletedTotal = 0;
      const batchSize = 50;
      
      while (true) {
        const res = await collection.limit(batchSize).remove();
        deletedTotal += res.deleted;
        
        console.log(`已删除 ${deletedTotal}/${total} 条`);
        
        if (res.deleted < batchSize) {
          break; // 没有更多数据了
        }
      }
      
      return {
        success: true,
        message: `已删除 ${deletedTotal} 条记录`,
        deleted: deletedTotal
      };
    } catch (e) {
      return {
        success: false,
        message: '删除失败: ' + e.message
      };
    }
  },

  /**
   * 按手机号覆盖更新（已存在则更新，不存在则新建）
   * @param {Array} users - 用户数据数组
   */
  async upsertByMobile(users) {
    if (!users || !Array.isArray(users) || users.length === 0) {
      return { success: false, message: '用户数据为空或格式错误' };
    }

    const collection = db.collection('uni-id-users');
    
    let updated = 0;
    let inserted = 0;
    const errors = [];

    console.log(`开始覆盖更新 ${users.length} 条数据...`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      if (!user.mobile) {
        errors.push({ index: i + 1, error: '缺少mobile字段' });
        continue;
      }

      try {
        // 查询是否存在
        const existing = await collection.where({ mobile: user.mobile }).limit(1).get();
        
        if (existing.data && existing.data.length > 0) {
          // 存在则更新
          await collection.where({ mobile: user.mobile }).update(user);
          updated++;
        } else {
          // 不存在则新建
          await collection.add(user);
          inserted++;
        }
        
        if ((i + 1) % 10 === 0) {
          console.log(`进度: ${i + 1}/${users.length}`);
        }
      } catch (e) {
        errors.push({ index: i + 1, mobile: user.mobile, error: e.message });
      }
    }

    return {
      success: errors.length === 0,
      message: `完成：更新 ${updated} 条，新增 ${inserted} 条，失败 ${errors.length} 条`,
      updated,
      inserted,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  /**
   * 按手机号补齐字段（仅更新，不新建）
   * 可更新字段：email, city, city_name, department, nickname, avatar, avatar_color
   * 不修改：password、register_date 等敏感或自动字段
   * @param {Array} users - 用户数据数组（至少包含 mobile）
   */
  async patchByMobile(users) {
    if (!users || !Array.isArray(users) || users.length === 0) {
      return { success: false, message: '用户数据为空或格式错误' };
    }

    const collection = db.collection('uni-id-users');

    // 部门白名单与映射
    const allowedDepartments = ["经理", "顾客部", "开拓部", "教研部", "商务部", "财务部", "法务部", "伙伴"];
    const deptMap = { 'AI效率部': '教研部' };

    let updated = 0;
    let skipped = 0;
    let missingMobile = 0;
    const errors = [];

    for (const u of users) {
      if (!u.mobile) { missingMobile++; continue; }

      // 读取现有
      const cur = await collection.where({ mobile: u.mobile }).limit(1).get();
      if (!cur.data || cur.data.length === 0) { skipped++; continue; }

      const doc = cur.data[0];

      // 组装更新对象（仅允许的字段）
      const update = {};
      if (u.email) update.email = u.email;

      if (u.city !== undefined && u.city !== null && u.city !== '') {
        const cityNum = typeof u.city === 'string' ? parseInt(u.city, 10) : u.city;
        if (!Number.isNaN(cityNum)) update.city = cityNum;
      }
      if (u.city_name) update.city_name = u.city_name;

      if (u.department) {
        const mapped = deptMap[u.department] || u.department;
        if (allowedDepartments.includes(mapped)) update.department = mapped; // 仅在枚举列表中
      }

      if (u.nickname) update.nickname = u.nickname;
      if (u.avatar) update.avatar = u.avatar;
      if (u.avatar_color) update.avatar_color = u.avatar_color;

      // 无需更新则跳过
      if (Object.keys(update).length === 0) { skipped++; continue; }

      try {
        await collection.where({ _id: doc._id }).update(update);
        updated++;
      } catch (e) {
        errors.push({ mobile: u.mobile, error: e.message, update });
      }
    }

    return {
      success: errors.length === 0,
      message: `已更新 ${updated} 条，跳过 ${skipped} 条，无手机号 ${missingMobile} 条，错误 ${errors.length} 条`,
      updated, skipped, missingMobile, errors
    };
  },

  /**
   * 检查并去重导入
   * 根据手机号去重，已存在的不导入
   * @param {Array} users - 用户数据数组
   * @returns {Object} 导入结果
   */
  async importWithDedupe(users) {
    if (!users || !Array.isArray(users) || users.length === 0) {
      return {
        success: false,
        message: '用户数据为空或格式错误'
      };
    }

    const collection = db.collection('uni-id-users');
    
    // 提取所有手机号
    const mobiles = users.map(u => u.mobile).filter(m => m);
    
    // 查询已存在的手机号
    const existingRes = await collection
      .where({
        mobile: db.command.in(mobiles)
      })
      .field({ mobile: true })
      .get();
    
    const existingMobiles = new Set(existingRes.data.map(u => u.mobile));
    
    // 过滤出不存在的用户
    const newUsers = users.filter(u => !existingMobiles.has(u.mobile));
    
    if (newUsers.length === 0) {
      return {
        success: true,
        message: '所有用户已存在，无需导入',
        total: users.length,
        existing: users.length,
        imported: 0
      };
    }
    
    // 批量导入新用户
    const result = await this.batchImport(newUsers);
    
    return {
      ...result,
      total: users.length,
      existing: users.length - newUsers.length,
      imported: result.successCount
    };
  }
};
