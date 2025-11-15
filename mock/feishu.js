// 飞书数据 Mock 数据
export default {
  // 飞书卡片列表
  cards: [
    {
      id: 'card_1',
      title: '咨询记录',
      description: '学生心理咨询和行为记录',
      icon: '📋',
      tableUrl: 'https://example.feishu.cn/base/xxx',
      recordCount: 156
    },
    {
      id: 'card_2',
      title: '家访记录',
      description: '家庭访问情况记录',
      icon: '🏠',
      tableUrl: 'https://example.feishu.cn/base/yyy',
      recordCount: 89
    },
    {
      id: 'card_3',
      title: '学生档案',
      description: '学生基本信息和档案',
      icon: '👤',
      tableUrl: 'https://example.feishu.cn/base/zzz',
      recordCount: 234
    }
  ],

  // 咨询记录列表
  consultationRecords: [
    {
      id: 'record_1',
      studentName: '张晓明',
      studentGrade: '三年级2班',
      studentGender: '男',
      consultationType: '心理咨询',
      consultationDate: '2025-01-15',
      consultationTime: '14:30',
      status: '已完成',
      statusColor: '#43A047',
      counselor: '李老师',
      duration: '45分钟',
      mainIssue: '学习压力',
      brief: '学生反映最近学习压力较大，担心期末考试成绩...',
      tags: ['学习焦虑', '考试压力'],
      priority: '中',
      followUp: true,
      parentNotified: true
    },
    {
      id: 'record_2',
      studentName: '王小红',
      studentGrade: '二年级1班',
      studentGender: '女',
      consultationType: '行为辅导',
      consultationDate: '2025-01-15',
      consultationTime: '10:00',
      status: '进行中',
      statusColor: '#FFA300',
      counselor: '张老师',
      duration: '30分钟',
      mainIssue: '注意力不集中',
      brief: '课堂上经常走神，容易被其他事物吸引...',
      tags: ['注意力', '课堂纪律'],
      priority: '高',
      followUp: false,
      parentNotified: false
    },
    {
      id: 'record_3',
      studentName: '刘强',
      studentGrade: '四年级3班',
      studentGender: '男',
      consultationType: '家庭问题',
      consultationDate: '2025-01-14',
      consultationTime: '15:00',
      status: '已完成',
      statusColor: '#43A047',
      counselor: '李老师',
      duration: '60分钟',
      mainIssue: '亲子关系',
      brief: '与家长沟通存在障碍，经常产生冲突...',
      tags: ['家庭关系', '沟通问题'],
      priority: '高',
      followUp: true,
      parentNotified: true
    },
    {
      id: 'record_4',
      studentName: '陈小华',
      studentGrade: '一年级2班',
      studentGender: '女',
      consultationType: '适应问题',
      consultationDate: '2025-01-14',
      consultationTime: '09:00',
      status: '待跟进',
      statusColor: '#EF4A81',
      counselor: '王老师',
      duration: '20分钟',
      mainIssue: '新生适应',
      brief: '刚转学过来，对新环境不太适应...',
      tags: ['新生适应', '社交问题'],
      priority: '中',
      followUp: true,
      parentNotified: false
    },
    {
      id: 'record_5',
      studentName: '赵明明',
      studentGrade: '五年级1班',
      studentGender: '男',
      consultationType: '学业辅导',
      consultationDate: '2025-01-13',
      consultationTime: '16:00',
      status: '已完成',
      statusColor: '#43A047',
      counselor: '李老师',
      duration: '40分钟',
      mainIssue: '偏科问题',
      brief: '数学成绩较好，但语文阅读理解较弱...',
      tags: ['学科问题', '学习方法'],
      priority: '中',
      followUp: false,
      parentNotified: true
    },
    {
      id: 'record_6',
      studentName: '孙丽丽',
      studentGrade: '三年级1班',
      studentGender: '女',
      consultationType: '情绪管理',
      consultationDate: '2025-01-13',
      consultationTime: '14:00',
      status: '已完成',
      statusColor: '#43A047',
      counselor: '张老师',
      duration: '35分钟',
      mainIssue: '情绪波动',
      brief: '最近情绪不稳定，容易哭泣...',
      tags: ['情绪问题', '心理健康'],
      priority: '高',
      followUp: true,
      parentNotified: true
    }
  ],

  // 筛选选项
  filterOptions: {
    consultationType: [
      { label: '全部', value: '' },
      { label: '心理咨询', value: '心理咨询' },
      { label: '行为辅导', value: '行为辅导' },
      { label: '家庭问题', value: '家庭问题' },
      { label: '适应问题', value: '适应问题' },
      { label: '学业辅导', value: '学业辅导' },
      { label: '情绪管理', value: '情绪管理' }
    ],
    status: [
      { label: '全部', value: '' },
      { label: '已完成', value: '已完成' },
      { label: '进行中', value: '进行中' },
      { label: '待跟进', value: '待跟进' }
    ],
    priority: [
      { label: '全部', value: '' },
      { label: '高', value: '高' },
      { label: '中', value: '中' },
      { label: '低', value: '低' }
    ],
    grade: [
      { label: '全部', value: '' },
      { label: '一年级', value: '一年级' },
      { label: '二年级', value: '二年级' },
      { label: '三年级', value: '三年级' },
      { label: '四年级', value: '四年级' },
      { label: '五年级', value: '五年级' },
      { label: '六年级', value: '六年级' }
    ]
  },

  // 获取记录详情
  getRecordDetail(recordId) {
    const record = this.consultationRecords.find(r => r.id === recordId);
    if (!record) return null;

    return {
      ...record,
      // 详细信息
      studentAge: 9,
      parentContact: '138****5678',
      consultationLocation: '心理咨询室',
      detailedDescription: `学生${record.studentName}主要表现为${record.mainIssue}的问题。通过深入交流了解到，问题产生的主要原因是...

【咨询过程】
1. 建立信任关系（5分钟）
2. 倾听学生诉说（15分钟）
3. 分析问题原因（10分钟）
4. 提供解决方案（10分钟）
5. 制定行动计划（5分钟）

【咨询建议】
- 建议家长多关注孩子的情绪变化
- 培养良好的学习习惯
- 定期进行心理健康评估

【后续计划】
下周三继续跟进，观察改善情况。`,
      previousRecords: [
        {
          date: '2025-01-08',
          brief: '首次咨询，建立档案'
        },
        {
          date: '2025-01-05',
          brief: '初步了解情况'
        }
      ]
    };
  }
};
