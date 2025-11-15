// 管理端云对象调用封装
// 统一 Loading、错误处理和返回结构

class AdminApiService {
  static async call(objectName, method, data = {}) {
    try {
      uni.showLoading({ title: '加载中...', mask: true });
      const cloudObject = uniCloud.importObject(objectName);
      const res = await cloudObject[method](data);
      uni.hideLoading();

      if (!res || typeof res !== 'object') {
        throw new Error('服务返回格式错误');
      }

      if (res.code === 0) {
        return res.data;
      }

      throw new Error(res.message || '请求失败');
    } catch (error) {
      uni.hideLoading();
      console.error(`[AdminApiService] ${objectName}.${method} error:`, error);
      uni.showToast({
        title: error.message || '请求失败',
        icon: 'none'
      });
      throw error;
    }
  }

  // 用户管理
  static user = {
    list: (params) => AdminApiService.call('admin', 'listUsers', params),
    update: (params) => AdminApiService.call('admin', 'updateUser', params),
    resetPassword: (params) => AdminApiService.call('admin', 'resetPassword', params)
  };

  // 城市管理
  static city = {
    list: () => AdminApiService.call('admin', 'listCities'),
    create: (data) => AdminApiService.call('admin', 'createCity', data),
    update: (data) => AdminApiService.call('admin', 'updateCity', data),
    delete: (id) => AdminApiService.call('admin', 'deleteCity', { id })
  };

  // 部门管理
  static department = {
    list: () => AdminApiService.call('admin', 'listDepartments'),
    create: (data) => AdminApiService.call('admin', 'createDepartment', data),
    update: (data) => AdminApiService.call('admin', 'updateDepartment', data),
    delete: (id) => AdminApiService.call('admin', 'deleteDepartment', { id })
  };

  // 智能体管理（直接使用 agent 云对象的管理方法）
  static agent = {
    list: (params) => AdminApiService.call('agent', 'adminList', params),
    create: (data) => AdminApiService.call('agent', 'create', data),
    update: (data) => AdminApiService.call('agent', 'update', data),
    delete: (id) => AdminApiService.call('agent', 'delete', { agent_id: id })
  };

  // 网页卡片管理
  static webCard = {
    list: (params) => AdminApiService.call('web-card', 'adminList', params),
    create: (data) => AdminApiService.call('web-card', 'create', data),
    update: (data) => AdminApiService.call('web-card', 'update', data),
    delete: (id) => AdminApiService.call('web-card', 'delete', { card_id: id })
  };

  // 飞书卡片管理
  static feishuCard = {
    list: (params) => AdminApiService.call('feishu', 'adminListCards', params),
    create: (data) => AdminApiService.call('feishu', 'create', data),
    update: (data) => AdminApiService.call('feishu', 'update', data),
    delete: (id) => AdminApiService.call('feishu', 'delete', { card_id: id }),
    verify: (id) => AdminApiService.call('feishu', 'detail', { card_id: id })
  };

  // 模型管理
  static model = {
    list: () => AdminApiService.call('admin', 'listModels'),
    create: (data) => AdminApiService.call('admin', 'createModel', data),
    update: (data) => AdminApiService.call('admin', 'updateModel', data),
    delete: (id) => AdminApiService.call('admin', 'deleteModel', { id })
  };
}

export default AdminApiService;
