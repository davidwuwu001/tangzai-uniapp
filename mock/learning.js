// 学习中心Mock数据
const learningData = {
  categories: ['全部', '教学资料', '培训视频', '政策文件', '工作手册'],
  
  materials: [
        {
          id: 1,
          title: '2024年教师培训手册',
          fileType: 'pdf',
          fileTypeText: 'PDF',
          size: '2.5 MB',
          uploadDate: '2024-10-15',
          icon: '📄',
          iconBg: 'rgba(252, 76, 2, 0.15)',
          tags: ['培训', '必读'],
          categories: ['全部', '教学资料', '工作手册']
        },
        {
          id: 2,
          title: '感统课程教学视频',
          fileType: 'video',
          fileTypeText: 'MP4',
          size: '156 MB',
          uploadDate: '2024-10-20',
          icon: '🎬',
          iconBg: 'rgba(255, 163, 0, 0.15)',
          tags: ['教学', '视频'],
          categories: ['全部', '培训视频']
        },
        {
          id: 3,
          title: '学员评估表模板',
          fileType: 'doc',
          fileTypeText: 'DOCX',
          size: '85 KB',
          uploadDate: '2024-10-25',
          icon: '📝',
          iconBg: 'rgba(45, 204, 211, 0.15)',
          tags: ['模板'],
          categories: ['全部', '工作手册']
        },
        {
          id: 4,
          title: '课程大纲与规划',
          fileType: 'pdf',
          fileTypeText: 'PDF',
          size: '1.8 MB',
          uploadDate: '2024-11-01',
          icon: '📄',
          iconBg: 'rgba(252, 76, 2, 0.15)',
          tags: ['教学'],
          categories: ['全部', '教学资料']
        },
        {
          id: 5,
          title: '教育政策解读2024',
          fileType: 'pdf',
          fileTypeText: 'PDF',
          size: '3.2 MB',
          uploadDate: '2024-09-10',
          icon: '📄',
          iconBg: 'rgba(252, 76, 2, 0.15)',
          tags: ['政策'],
          categories: ['全部', '政策文件']
        },
        {
          id: 6,
          title: '课堂管理技巧培训',
          fileType: 'video',
          fileTypeText: 'MP4',
          size: '220 MB',
          uploadDate: '2024-11-05',
          icon: '🎬',
          iconBg: 'rgba(255, 163, 0, 0.15)',
          tags: ['培训', '管理'],
          categories: ['全部', '培训视频']
        }
      ]
};

export default learningData;
