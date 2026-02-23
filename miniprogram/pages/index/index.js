// pages/index/index.js
Page({
  data: {
    userInfo: {},
    recentJournals: [],
    moodStats: [],
  },

  onLoad() {
    this.loadUserInfo();
    this.loadRecentJournals();
    this.loadMoodStats();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadRecentJournals();
    this.loadMoodStats();
  },

  // 加载用户信息
  loadUserInfo() {
    // 模拟用户信息，实际应该从登录接口获取
    this.setData({
      userInfo: {
        nickName: '用户',
        avatar: '',
      },
    });
  },

  // 加载最近日记
  loadRecentJournals() {
    // 模拟最近日记数据，实际应该从接口获取
    const mockJournals = [
      {
        id: '1',
        content: '今天天气很好，心情不错，完成了很多工作。',
        timestamp: Date.now() - 3600000,
        tags: ['工作', '心情'],
      },
      {
        id: '2',
        content: '和朋友一起吃饭，聊了很多有趣的话题。',
        timestamp: Date.now() - 86400000,
        tags: ['社交', '生活'],
      },
    ];

    this.setData({
      recentJournals: mockJournals,
    });
  },

  // 加载心情统计
  loadMoodStats() {
    // 模拟心情统计数据，实际应该从接口获取
    const mockStats = [
      { mood: '开心', count: 12, percentage: 60 },
      { mood: '平静', count: 5, percentage: 25 },
      { mood: '焦虑', count: 3, percentage: 15 },
    ];

    this.setData({
      moodStats: mockStats,
    });
  },

  // 跳转到日记页面
  goToJournal() {
    wx.navigateTo({
      url: '../journal/journal',
    });
  },

  // 跳转到分析页面
  goToAnalysis() {
    wx.navigateTo({
      url: '../analysis/analysis',
    });
  },

  // 跳转到设置页面
  goToSettings() {
    wx.navigateTo({
      url: '../settings/settings',
    });
  },

  // 查看日记详情
  viewJournalDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../journal/journal?id=${id}`,
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return date.toLocaleDateString();
    }
  },
});