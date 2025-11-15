// 服务页面Mock数据
export default {
  // 获取服务数据
  getServiceData() {
    return {
      // 本月统计
      monthStats: {
        totalConsultations: 8,
        todayScheduled: 3,
        pending: 2
      },
      
      // 日历数据
      calendarRecords: {
        '2024-11-03': 2,
        '2024-11-08': 1,
        '2024-11-15': 3
      },
      
      // 今日咨询列表
      todayConsultations: [
        {
          id: 1,
          clientName: '王小明家长',
          startTime: '09:00',
          endTime: '10:00',
          status: 'completed', // completed, ongoing, pending
          statusText: '已完成',
          type: '学习规划',
          advisor: '张老师'
        },
        {
          id: 2,
          clientName: '李晓华家长',
          startTime: '14:00',
          endTime: '15:00',
          status: 'ongoing',
          statusText: '进行中',
          type: '能力测评',
          advisor: '李老师'
        },
        {
          id: 3,
          clientName: '陈佳怡家长',
          startTime: '16:30',
          endTime: '17:30',
          status: 'pending',
          statusText: '待开始',
          type: '课程咨询',
          advisor: '王老师'
        }
      ]
    };
  }
};
