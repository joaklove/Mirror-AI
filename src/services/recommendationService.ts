import { UserActivity, FeatureUsage, UserLevel, Recommendation } from '../types';

// 模拟数据存储
class MockStorage {
  private data: Record<string, any> = {};

  async set(path: string, data: any): Promise<void> {
    this.data[path] = { ...data, timestamp: new Date() };
  }

  async get(path: string): Promise<any | null> {
    return this.data[path] || null;
  }

  async getAll(collectionPath: string): Promise<any[]> {
    const keys = Object.keys(this.data).filter(key => key.startsWith(collectionPath));
    return keys.map(key => this.data[key]);
  }

  async update(path: string, data: any): Promise<void> {
    if (this.data[path]) {
      this.data[path] = { ...this.data[path], ...data };
    }
  }
}

class RecommendationService {
  private storage = new MockStorage();

  async trackUserActivity(activity: UserActivity): Promise<void> {
    // 模拟用户ID
    const userId = 'mock-user-id';
    const path = `users/${userId}/activities/${Date.now()}`;
    await this.storage.set(path, {
      ...activity,
      userId
    });
  }

  async trackFeatureUsage(featureUsage: FeatureUsage): Promise<void> {
    // 模拟用户ID
    const userId = 'mock-user-id';
    const path = `users/${userId}/featureUsage/${Date.now()}`;
    await this.storage.set(path, {
      ...featureUsage,
      userId
    });

    await this.updateFeatureStats(userId, featureUsage.featureId);
  }

  private async updateFeatureStats(userId: string, featureId: string): Promise<void> {
    const statsPath = `users/${userId}/featureStats/${featureId}`;
    try {
      const existingStats = await this.storage.get(statsPath);

      if (existingStats) {
        await this.storage.update(statsPath, {
          usageCount: (existingStats.usageCount || 0) + 1,
          lastUsed: new Date(),
          totalTimeSpent: (existingStats.totalTimeSpent || 0) + 1
        });
      } else {
        await this.storage.set(statsPath, {
          featureId,
          usageCount: 1,
          firstUsed: new Date(),
          lastUsed: new Date(),
          totalTimeSpent: 1
        });
      }
    } catch (error) {
      console.error('Error updating feature stats:', error);
    }
  }

  async getUserLevel(userId: string): Promise<UserLevel> {
    try {
      const usageData = await this.storage.getAll(`users/${userId}/featureUsage`);
      const activityData = await this.storage.getAll(`users/${userId}/activities`);
      
      const totalUsage = usageData.length;
      const totalActivities = activityData.length;
      const daysActive = this.calculateDaysActive(activityData);

      let level: UserLevel = 'beginner';
      
      if (totalUsage > 100 && daysActive > 30) {
        level = 'expert';
      } else if (totalUsage > 50 && daysActive > 15) {
        level = 'advanced';
      } else if (totalUsage > 10 && daysActive > 5) {
        level = 'intermediate';
      }

      return level;
    } catch (error) {
      console.error('Error calculating user level:', error);
      return 'beginner';
    }
  }

  private calculateDaysActive(activityData: any[]): number {
    const activeDays = new Set();
    activityData.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      activeDays.add(dayKey);
    });
    return activeDays.size;
  }

  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      const userLevel = await this.getUserLevel(userId);
      const usageStats = await this.getUserFeatureStats(userId);
      const recentActivities = await this.getRecentActivities(userId, 10);

      const allFeatures = await this.getAllFeatures();
      const recommendations: Recommendation[] = [];

      // 基于用户级别推荐功能
      const levelBasedFeatures = allFeatures.filter(feature => 
        this.isSuitableForLevel(feature, userLevel)
      );

      // 基于使用频率推荐功能
      const frequencyBasedFeatures = this.recommendBasedOnUsage(usageStats, allFeatures);

      // 基于最近活动推荐功能
      const activityBasedFeatures = this.recommendBasedOnActivities(recentActivities, allFeatures);

      // 合并推荐结果，去重并排序
      const combinedFeatures = [...new Set([...levelBasedFeatures, ...frequencyBasedFeatures, ...activityBasedFeatures])];
      
      // 计算推荐分数
      combinedFeatures.forEach(feature => {
        const score = this.calculateRecommendationScore(feature, userLevel, usageStats, recentActivities);
        recommendations.push({
          featureId: feature.id,
          title: feature.title,
          description: feature.description,
          score,
          reason: this.generateRecommendationReason(feature, userLevel, usageStats, recentActivities)
        });
      });

      // 按分数排序，返回前10个推荐
      return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private async getUserFeatureStats(userId: string): Promise<any[]> {
    try {
      const statsData = await this.storage.getAll(`users/${userId}/featureStats`);
      return statsData.map(stat => ({
        featureId: stat.featureId,
        ...stat
      }));
    } catch (error) {
      console.error('Error getting user feature stats:', error);
      return [];
    }
  }

  private async getRecentActivities(userId: string, limit: number): Promise<any[]> {
    try {
      const activityData = await this.storage.getAll(`users/${userId}/activities`);
      return activityData
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  private async getAllFeatures(): Promise<any[]> {
    // 模拟功能列表，实际应该从数据库获取
    return [
      { id: 'diary', title: '日记记录', description: '记录你的日常思绪和感受', requiredLevel: 'beginner' },
      { id: 'mood-tracker', title: '情绪追踪', description: '追踪和分析你的情绪变化', requiredLevel: 'beginner' },
      { id: 'goal-setting', title: '目标设定', description: '设定和追踪你的个人目标', requiredLevel: 'beginner' },
      { id: 'habit-tracker', title: '习惯追踪', description: '养成良好的习惯', requiredLevel: 'intermediate' },
      { id: 'gratitude-journal', title: '感恩日记', description: '记录你感恩的事情', requiredLevel: 'beginner' },
      { id: 'life-balance', title: '生活平衡', description: '分析你生活的各个方面', requiredLevel: 'intermediate' },
      { id: 'personality-analysis', title: '性格分析', description: '了解你的性格特点', requiredLevel: 'advanced' },
      { id: 'career-planning', title: '职业规划', description: '规划你的职业生涯', requiredLevel: 'advanced' },
      { id: 'financial-goals', title: '财务目标', description: '设定和追踪财务目标', requiredLevel: 'intermediate' },
      { id: 'health-tracker', title: '健康追踪', description: '追踪你的健康指标', requiredLevel: 'intermediate' },
      { id: 'learning-plan', title: '学习计划', description: '制定和追踪学习计划', requiredLevel: 'intermediate' },
      { id: 'time-management', title: '时间管理', description: '更有效地管理你的时间', requiredLevel: 'advanced' },
      { id: 'relationship-management', title: '关系管理', description: '改善你的人际关系', requiredLevel: 'advanced' },
      { id: 'creativity-exercises', title: '创造力练习', description: '激发你的创造力', requiredLevel: 'intermediate' },
      { id: 'mindfulness-practice', title: '正念练习', description: '培养正念和专注力', requiredLevel: 'beginner' }
    ];
  }

  private isSuitableForLevel(feature: any, userLevel: UserLevel): boolean {
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
    const featureLevelIndex = levelOrder.indexOf(feature.requiredLevel);
    const userLevelIndex = levelOrder.indexOf(userLevel);
    return featureLevelIndex <= userLevelIndex + 1; // 允许比当前级别高一级的功能
  }

  private recommendBasedOnUsage(usageStats: any[], allFeatures: any[]): any[] {
    // 找出使用频率低但适合用户的功能
    const usedFeatureIds = new Set(usageStats.map(stat => stat.featureId));
    return allFeatures.filter(feature => !usedFeatureIds.has(feature.id));
  }

  private recommendBasedOnActivities(activities: any[], allFeatures: any[]): any[] {
    // 基于最近活动推荐相关功能
    const activityTypes = new Set(activities.map(activity => activity.type));
    return allFeatures.filter(feature => {
      // 这里应该添加活动类型与功能的匹配逻辑
      return true; // 暂时返回所有功能
    });
  }

  private calculateRecommendationScore(feature: any, userLevel: UserLevel, usageStats: any[], activities: any[]): number {
    let score = 0;

    // 基于用户级别
    const levelScore = this.getLevelScore(feature, userLevel);
    score += levelScore;

    // 基于使用频率（使用越少得分越高）
    const usageScore = this.getUsageScore(feature.id, usageStats);
    score += usageScore;

    // 基于活动相关性
    const activityScore = this.getActivityScore(feature, activities);
    score += activityScore;

    return score;
  }

  private getLevelScore(feature: any, userLevel: UserLevel): number {
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
    const featureLevelIndex = levelOrder.indexOf(feature.requiredLevel);
    const userLevelIndex = levelOrder.indexOf(userLevel);

    if (featureLevelIndex === userLevelIndex) return 5; // 完全匹配
    if (featureLevelIndex === userLevelIndex + 1) return 4; // 稍微高级
    if (featureLevelIndex === userLevelIndex - 1) return 3; // 稍微低级
    return 2; // 不匹配
  }

  private getUsageScore(featureId: string, usageStats: any[]): number {
    const usageStat = usageStats.find(stat => stat.featureId === featureId);
    if (!usageStat) return 5; // 未使用过
    if (usageStat.usageCount < 5) return 4; // 很少使用
    if (usageStat.usageCount < 10) return 3; // 偶尔使用
    return 1; // 经常使用
  }

  private getActivityScore(feature: any, activities: any[]): number {
    // 基于活动类型与功能的相关性计算分数
    // 暂时返回固定分数
    return 3;
  }

  private generateRecommendationReason(feature: any, userLevel: UserLevel, usageStats: any[], activities: any[]): string {
    const usageStat = usageStats.find(stat => stat.featureId === feature.id);
    
    if (!usageStat) {
      return `你还没有使用过${feature.title}功能，它可能对你很有帮助。`;
    }
    
    if (usageStat.usageCount < 5) {
      return `你很少使用${feature.title}功能，尝试更多使用它来获得更多好处。`;
    }
    
    return `${feature.title}功能与你当前的用户级别很匹配，继续使用它来提升自己。`;
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const preferencesPath = `users/${userId}/preferences/featureRecommendations`;
      await this.storage.set(preferencesPath, preferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  async getRecommendationClickThroughRate(): Promise<number> {
    // 计算推荐功能的点击率
    // 暂时返回模拟数据
    return 0.25; // 25%
  }
}

export const recommendationService = new RecommendationService();
