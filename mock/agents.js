// 智能体列表Mock数据
const agentsData = {
  // 常用智能体
  favoriteAgents: [
    {
      id: 1,
      name: '教学助手',
      icon: '👩‍🏫',
      iconBg: 'rgba(76, 18, 161, 0.15)'
    },
    {
      id: 2,
      name: '写作助手',
      icon: '✍️',
      iconBg: 'rgba(255, 163, 0, 0.15)'
    },
    {
      id: 3,
      name: '英语对话',
      icon: '🗣️',
      iconBg: 'rgba(45, 204, 211, 0.15)'
    },
    {
      id: 4,
      name: '课程规划',
      icon: '📚',
      iconBg: 'rgba(76, 18, 161, 0.15)'
    }
  ],
  
  // 分类标签
  categories: ['全部', '教学', '写作', '编程', '数学', '英语', '物理'],
  
  // 所有智能体
  allAgents: [
    {
      id: 1,
      name: '教学助手',
      description: '辅助备课与教学',
      icon: '👩‍🏫',
      iconBg: 'rgba(76, 18, 161, 0.15)',
      categories: ['全部', '教学']
    },
    {
      id: 2,
      name: '写作助手',
      description: '文章润色与指导',
      icon: '✍️',
      iconBg: 'rgba(255, 163, 0, 0.15)',
      categories: ['全部', '写作']
    },
    {
      id: 3,
      name: '英语对话',
      description: '口语练习伙伴',
      icon: '🗣️',
      iconBg: 'rgba(45, 204, 211, 0.15)',
      categories: ['全部', '英语']
    },
    {
      id: 4,
      name: '物理实验',
      description: '实验设计与分析',
      icon: '🔬',
      iconBg: 'rgba(252, 76, 2, 0.15)',
      categories: ['全部', '物理']
    },
    {
      id: 5,
      name: '编程导师',
      description: '代码学习辅导',
      icon: '💻',
      iconBg: 'rgba(239, 74, 129, 0.15)',
      categories: ['全部', '编程']
    },
    {
      id: 6,
      name: '数学解题',
      description: '解题思路讲解',
      icon: '📐',
      iconBg: 'rgba(201, 100, 207, 0.15)',
      categories: ['全部', '数学']
    },
    {
      id: 7,
      name: '课程规划',
      description: '教学计划制定',
      icon: '📚',
      iconBg: 'rgba(76, 18, 161, 0.15)',
      categories: ['全部', '教学']
    },
    {
      id: 8,
      name: '论文助手',
      description: '学术写作辅导',
      icon: '📝',
      iconBg: 'rgba(255, 163, 0, 0.15)',
      categories: ['全部', '写作']
    }
  ]
};

export default agentsData;
