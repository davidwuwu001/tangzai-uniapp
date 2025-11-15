// 测试数据初始化 - 智能体
'use strict';

module.exports = {
  async init() {
    try {
      const db = uniCloud.database();
      const agentsCollection = db.collection('agents');
      
      // 检查是否已有数据
      const existingData = await agentsCollection.count();
      if (existingData.total > 0) {
        return {
          code: 0,
          message: `已存在 ${existingData.total} 条数据，跳过初始化`
        };
      }
      
      // 测试智能体数据
      const testAgents = [
        {
          name: '教学设计助手',
          description: '帮助教师设计教学方案和课程内容',
          icon: '📚',
          icon_bg: '#4C12A1',
          navigation_tab: '教学设计',
          agent_type: 'volcengine',
          system_prompt: '你是一个专业的教学设计助手，帮助教师设计高质量的教学方案。',
          model_id: '',
          cities: ['all'],
          departments: ['all'],
          is_active: true,
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          name: '学生管理助手',
          description: '协助管理学生信息和学习进度',
          icon: '👨‍🎓',
          icon_bg: '#2196F3',
          navigation_tab: '学生管理',
          agent_type: 'volcengine',
          system_prompt: '你是一个学生管理助手，帮助教师管理学生信息。',
          model_id: '',
          cities: ['all'],
          departments: ['all'],
          is_active: true,
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          name: '教研分析助手',
          description: '分析教学数据，提供改进建议',
          icon: '📊',
          icon_bg: '#FF9800',
          navigation_tab: '教研分析',
          agent_type: 'volcengine',
          system_prompt: '你是一个教研分析助手，帮助分析教学数据并提供改进建议。',
          model_id: '',
          cities: ['all'],
          departments: ['all'],
          is_active: true,
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          name: '家校沟通助手',
          description: '促进家长和学校的有效沟通',
          icon: '💬',
          icon_bg: '#4CAF50',
          navigation_tab: '家校沟通',
          agent_type: 'volcengine',
          system_prompt: '你是一个家校沟通助手，帮助促进家长和学校的沟通。',
          model_id: '',
          cities: ['all'],
          departments: ['all'],
          is_active: true,
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          name: '课程设计助手',
          description: '协助设计课程大纲和教学计划',
          icon: '📖',
          icon_bg: '#9C27B0',
          navigation_tab: '课程设计',
          agent_type: 'volcengine',
          system_prompt: '你是一个课程设计助手，帮助设计课程大纲和教学计划。',
          model_id: '',
          cities: ['all'],
          departments: ['all'],
          is_active: true,
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ];
      
      // 批量插入
      const results = [];
      for (const agent of testAgents) {
        const res = await agentsCollection.add(agent);
        results.push(res);
      }
      
      return {
        code: 0,
        message: `成功初始化 ${results.length} 个智能体`,
        data: {
          count: results.length
        }
      };
      
    } catch (error) {
      console.error('初始化失败:', error);
      return {
        code: 500,
        message: error.message || '初始化失败'
      };
    }
  }
};
