// 工作台Mock数据
export default {
  // 通知列表
  notices: [
    {
      id: 1,
      icon: '📝',
      iconBg: 'rgba(76, 18, 161, 0.15)',
      title: '关于新版教师评估标准的通知',
      tag: '教学部',
      tagClass: 'teaching',
      time: '今天 09:30'
    },
    {
      id: 2,
      icon: '🎉',
      iconBg: 'rgba(255, 163, 0, 0.15)',
      title: '周末亲子活动安排',
      tag: '活动组',
      tagClass: 'activity',
      time: '昨天 16:45'
    },
    {
      id: 3,
      icon: '🛠',
      iconBg: 'rgba(45, 204, 211, 0.15)',
      title: '系统升级公告',
      tag: '技术部',
      tagClass: 'tech',
      time: '前天 14:20'
    },
    {
      id: 4,
      icon: '🎯',
      iconBg: 'rgba(239, 74, 129, 0.15)',
      title: '教师培训计划',
      tag: '培训组',
      tagClass: 'training',
      time: '3天前'
    }
  ],
  
  // 今日待办
  todos: [
    {
      id: 1,
      time: '14:30',
      timeColor: '#C964CF',
      content: '王小明家长咨询',
      status: '即将开始',
      statusClass: 'upcoming'
    },
    {
      id: 2,
      time: '17:00',
      timeColor: '#FC4C02',
      content: '张丽训练打卡提醒',
      status: '未完成',
      statusClass: 'pending'
    },
    {
      id: 3,
      time: '10:00',
      timeColor: '#2DCCD3',
      content: '李华能力评估报告',
      status: '已完成',
      statusClass: 'completed'
    }
  ],
  
  // 快捷入口
  quickActions: [
    {
      id: 1,
      label: 'AI智能体',
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3ef754-660cdc92-be6e-47e6-ba55-2fcbbedb55d3.svg',
      iconBg: 'rgba(252, 76, 2, 0.12)',
      path: '/pages/teaching/teaching'
    },
    {
      id: 2,
      label: '咨询安排',
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3e9b03-b9ca2e11-7c17-43bf-a7c5-381ca24a003b.svg',
      iconBg: 'rgba(255, 163, 0, 0.12)',
      path: '/pages/calendar/calendar'
    },
    {
      id: 3,
      label: '服务打卡',
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3e243a-15e48f1a-2e7e-4bcd-91f3-f408e17fc9a4.svg',
      iconBg: 'rgba(239, 74, 129, 0.12)',
      path: '/pages/checkin/checkin'
    },
    {
      id: 4,
      label: '信息录入',
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3ecfce-c82d2609-3a3d-423a-9901-1ba8c46424e2.svg',
      iconBg: 'rgba(45, 204, 211, 0.12)',
      path: '/pages/input/input'
    },
    {
      id: 5,
      label: '学习资料',
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3ea131-04a1b31f-b7b3-43df-9360-32cd6a8dd3e9.svg',
      iconBg: 'rgba(201, 100, 207, 0.12)',
      path: '/pages/learning/learning'
    },
    {
      id: 6,
      label: '全部功能',
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19a7c633e3e93cc-1f77fdd3-b13d-491d-ae2b-97c1d642c811.svg',
      iconBg: 'rgba(76, 18, 161, 0.12)',
      path: '/pages/all/all'
    }
  ]
}
