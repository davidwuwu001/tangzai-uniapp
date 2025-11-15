// AI对话Mock数据
export default {
  // 获取快捷问题
  getQuickQuestions(agentType = 'teaching') {
    const questions = {
      teaching: [
        '如何设计一节有趣的数学课?',
        '帮我写一份小学语文教案',
        '怎样提高学生的课堂参与度?'
      ],
      writing: [
        '如何提高写作能力?',
        '帮我润色这段文字',
        '给我一些写作技巧'
      ],
      english: [
        '如何提高英语口语?',
        '帮我纠正这句话的语法',
        '推荐一些英语学习资源'
      ]
    };
    
    return questions[agentType] || questions.teaching;
  },
  
  // 模拟AI回复
  async getMockResponse(userMessage) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      '好的,我理解您的问题。让我为您详细解答...',
      '这是一个很好的问题!我的建议是...',
      '根据您的描述,我认为可以从以下几个方面考虑...',
      '让我为您整理一下思路...'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      role: 'assistant',
      content: randomResponse + '\n\n' + userMessage + '\n\n这是一个模拟回复,实际对接后会返回真实的AI响应。',
      timestamp: new Date().toISOString()
    };
  },
  
  // 获取历史对话列表
  getChatHistory() {
    return [
      {
        id: 1,
        agentName: '教学助手',
        agentIcon: '👩‍🏫',
        lastMessage: '如何设计一节有趣的数学课?',
        timestamp: '2024-11-15 09:30',
        unread: 0
      },
      {
        id: 2,
        agentName: '写作助手',
        agentIcon: '✍️',
        lastMessage: '帮我润色这段文字',
        timestamp: '2024-11-14 16:20',
        unread: 2
      },
      {
        id: 3,
        agentName: '英语对话',
        agentIcon: '🗣️',
        lastMessage: '如何提高英语口语?',
        timestamp: '2024-11-13 14:15',
        unread: 0
      }
    ];
  },
  
  // 对话历史列表（用于历史页面）
  conversationHistory: [
    {
      id: 'conv_1',
      agentId: '1',
      agentName: '教学助手',
      agentIcon: '👩‍🏫',
      lastMessage: '如何设计一节有趣的数学课？设计有趣的数学课需要从以下几个方面入手...',
      messageCount: 12,
      updatedAt: Date.now() - 1000 * 60 * 30,
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      isFavorite: false
    },
    {
      id: 'conv_2',
      agentId: '1',
      agentName: '教学助手',
      agentIcon: '👩‍🏫',
      lastMessage: '小学语文教案模板。为您提供一份完整的小学语文教案模板...',
      messageCount: 8,
      updatedAt: Date.now() - 1000 * 60 * 60 * 5,
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      isFavorite: true
    },
    {
      id: 'conv_3',
      agentId: '1',
      agentName: '教学助手',
      agentIcon: '👩‍🏫',
      lastMessage: '如何提高学生的课堂参与度？提高学生课堂参与度可以从以下几个方面着手...',
      messageCount: 15,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
      createdAt: Date.now() - 1000 * 60 * 60 * 25,
      isFavorite: false
    },
    {
      id: 'conv_4',
      agentId: '1',
      agentName: '教学助手',
      agentIcon: '👩‍🏫',
      lastMessage: '家长沟通技巧。与家长有效沟通需要注意保持专业和耐心...',
      messageCount: 6,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      isFavorite: false
    },
    {
      id: 'conv_5',
      agentId: '1',
      agentName: '教学助手',
      agentIcon: '👩‍🏫',
      lastMessage: '期末考试复习计划。期末复习需要系统规划，第一阶段-知识梳理...',
      messageCount: 10,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      isFavorite: false
    },
    {
      id: 'conv_6',
      agentId: '2',
      agentName: '写作助手',
      agentIcon: '✍️',
      lastMessage: '学困生辅导方案。针对学困生的辅导需要个性化方案...',
      messageCount: 7,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      isFavorite: false
    }
  ]
};
