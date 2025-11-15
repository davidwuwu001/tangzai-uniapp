// 个人中心Mock数据
const profileData = {
  userInfo: {
    name: '张老师',
    avatar: '👨‍🏫',
    role: '高级顾问',
    city: '上海',
    department: '教学部'
  },
  
  stats: {
    consultations: 128,
    students: 45,
    materials: 67
  },
  
  menuSections: [
        {
          title: '常用功能',
          items: [
            {
              icon: '⚙️',
              iconClass: 'purple',
              title: '设置',
              desc: '账号与偏好设置',
              path: '/pages/settings/settings'
            },
            {
              icon: '📊',
              iconClass: 'orange',
              title: '我的数据',
              desc: '查看个人统计数据',
              badge: null
            },
            {
              icon: '📋',
              iconClass: 'blue',
              title: '工作记录',
              desc: '查看历史工作记录'
            }
          ]
        },
        {
          title: '帮助与反馈',
          items: [
            {
              icon: '📱',
              iconClass: 'pink',
              title: '关于我们',
              desc: '汤仔助手 v1.0.0'
            },
            {
              icon: '💬',
              iconClass: 'green',
              title: '意见反馈',
              desc: '您的建议很重要',
              badge: null
            }
          ]
        }
      ]
};

export default profileData;
