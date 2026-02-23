import { JournalEntry } from './journalService';

// 专业领域类型
export type ProfessionalDomain = 'mental-health' | 'career' | 'finance' | 'health' | 'education' | 'relationships';

// 专业领域分析结果接口
export interface DomainAnalysis {
  domain: ProfessionalDomain;
  score: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  insights: string[];
  actionItems: ActionItem[];
}

// 行动项接口
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  domain: ProfessionalDomain;
}

// 专业领域资源接口
export interface DomainResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'podcast' | 'tool' | 'course';
  url: string;
  description: string;
  domain: ProfessionalDomain;
  relevanceScore: number;
}

// 专业领域专家接口
export interface DomainExpert {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  bio: string;
  domain: ProfessionalDomain;
  rating: number;
  contactInfo?: {
    email?: string;
    website?: string;
    social?: string;
  };
}

// 模拟数据存储
class MockProfessionalStorage {
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

  async delete(path: string): Promise<void> {
    delete this.data[path];
  }
}

class ProfessionalService {
  private storage = new MockProfessionalStorage();

  // 获取专业领域分析
  async getDomainAnalysis(domain: ProfessionalDomain, entries: JournalEntry[]): Promise<DomainAnalysis> {
    try {
      // 基于日记条目分析专业领域
      const analysis = this.analyzeDomain(domain, entries);
      
      // 存储分析结果
      await this.storage.set(`domain-analyses/${domain}-${Date.now()}`, analysis);
      
      return analysis;
    } catch (error) {
      console.error(`Error analyzing ${domain} domain:`, error);
      throw error;
    }
  }

  // 分析专业领域
  private analyzeDomain(domain: ProfessionalDomain, entries: JournalEntry[]): DomainAnalysis {
    // 过滤与该领域相关的日记条目
    const relevantEntries = entries.filter(entry => 
      this.isEntryRelevantToDomain(entry, domain)
    );

    // 计算领域得分
    const score = this.calculateDomainScore(domain, relevantEntries);

    // 生成分析结果
    return {
      domain,
      score,
      strengths: this.getDomainStrengths(domain, relevantEntries),
      areasForImprovement: this.getAreasForImprovement(domain, relevantEntries),
      recommendations: this.getDomainRecommendations(domain, relevantEntries),
      insights: this.getDomainInsights(domain, relevantEntries),
      actionItems: this.generateActionItems(domain, relevantEntries)
    };
  }

  // 判断日记条目是否与领域相关
  private isEntryRelevantToDomain(entry: JournalEntry, domain: ProfessionalDomain): boolean {
    const domainKeywords = this.getDomainKeywords(domain);
    const entryText = `${entry.content} ${entry.tags?.join(' ')} ${entry.dimension || ''}`;
    const lowerCaseText = entryText.toLowerCase();
    
    return domainKeywords.some(keyword => lowerCaseText.includes(keyword.toLowerCase()));
  }

  // 获取领域关键词
  private getDomainKeywords(domain: ProfessionalDomain): string[] {
    const keywords: Record<ProfessionalDomain, string[]> = {
      'mental-health': ['焦虑', '抑郁', '压力', '情绪', '心理健康', '心理', '治疗', '咨询', '冥想', '正念', '放松', '心理健康', '情绪管理', '心理状态'],
      'career': ['工作', '职业', '事业', '职场', '职业规划', '职业发展', '晋升', '面试', '简历', '工作压力', '职业目标', '职业满意度', '职业倦怠'],
      'finance': ['财务', '金钱', '理财', '投资', '储蓄', '预算', '支出', '收入', '财务规划', '财务目标', '财务压力', '债务', '财务状况'],
      'health': ['健康', '身体', '运动', '饮食', '睡眠', '疾病', '医疗', '健康状况', '健康目标', '体重', '锻炼', '营养', '健康习惯'],
      'education': ['学习', '教育', '课程', '培训', '知识', '技能', '学习目标', '学习计划', '学习进度', '学习方法', '学习压力', '考试', '证书'],
      'relationships': ['关系', '家庭', '朋友', '社交', '爱情', '婚姻', '亲情', '友情', '人际关系', '沟通', '冲突', '关系质量', '社交活动']
    };
    return keywords[domain];
  }

  // 计算领域得分
  private calculateDomainScore(domain: ProfessionalDomain, entries: JournalEntry[]): number {
    if (entries.length === 0) return 50;
    
    // 基于条目的情感和内容计算得分
    let positiveCount = 0;
    let totalEntries = entries.length;

    entries.forEach(entry => {
      const lowerCaseContent = entry.content.toLowerCase();
      const positiveWords = this.getPositiveWords(domain);
      const negativeWords = this.getNegativeWords(domain);
      
      const hasPositive = positiveWords.some(word => lowerCaseContent.includes(word));
      const hasNegative = negativeWords.some(word => lowerCaseContent.includes(word));
      
      if (hasPositive && !hasNegative) positiveCount++;
      if (hasNegative && !hasPositive) positiveCount--;
    });

    // 计算得分（0-100）
    const baseScore = 50;
    const scoreAdjustment = (positiveCount / totalEntries) * 50;
    const finalScore = Math.max(0, Math.min(100, baseScore + scoreAdjustment));
    
    return Math.round(finalScore);
  }

  // 获取积极词汇
  private getPositiveWords(domain: ProfessionalDomain): string[] {
    const positiveWords: Record<ProfessionalDomain, string[]> = {
      'mental-health': ['开心', '快乐', '平静', '放松', '满足', '幸福', '积极', '乐观', '希望', '进步'],
      'career': ['成功', '晋升', '满意', '成就', '进步', '成长', '机会', '挑战', '学习', '发展'],
      'finance': ['节省', '投资', '盈利', '增长', '目标', '计划', '预算', '控制', '稳定', '安全'],
      'health': ['健康', '活力', '精力', '运动', '营养', '睡眠', '恢复', '进步', '坚持', '习惯'],
      'education': ['学习', '知识', '技能', '进步', '理解', '掌握', '应用', '成长', '挑战', '成就'],
      'relationships': ['爱', '关心', '支持', '理解', '沟通', '和谐', '快乐', '友谊', '亲情', '连接']
    };
    return positiveWords[domain];
  }

  // 获取消极词汇
  private getNegativeWords(domain: ProfessionalDomain): string[] {
    const negativeWords: Record<ProfessionalDomain, string[]> = {
      'mental-health': ['焦虑', '抑郁', '压力', '悲伤', '愤怒', '恐惧', '绝望', '孤独', '无助', '疲惫'],
      'career': ['压力', '倦怠', '无聊', '不满', '挫折', '失败', '冲突', '停滞', '担忧', '焦虑'],
      'finance': ['债务', '支出', '亏损', '压力', '担忧', '焦虑', '失控', '不足', '危机', '困难'],
      'health': ['疼痛', '疾病', '疲劳', '压力', '焦虑', '担忧', '不健康', '习惯', '问题', '挑战'],
      'education': ['困难', '挫折', '压力', '焦虑', '担忧', '困惑', '落后', '挑战', '失败', '疲惫'],
      'relationships': ['冲突', '争吵', '误解', '孤独', '失望', '愤怒', '悲伤', '压力', '焦虑', '担忧']
    };
    return negativeWords[domain];
  }

  // 获取领域优势
  private getDomainStrengths(domain: ProfessionalDomain, entries: JournalEntry[]): string[] {
    const strengthsMap: Record<ProfessionalDomain, string[]> = {
      'mental-health': ['情绪觉察能力', '积极应对策略', '寻求支持的意愿', '自我反思能力', '情绪管理技巧'],
      'career': ['专业技能', '工作态度', '学习能力', '团队合作', '问题解决能力'],
      'finance': ['储蓄习惯', '预算管理', '投资意识', '财务规划', '消费控制'],
      'health': ['健康意识', '运动习惯', '饮食习惯', '睡眠质量', '自我照顾'],
      'education': ['学习动机', '学习方法', '知识应用', '持续学习', '时间管理'],
      'relationships': ['沟通能力', '同理心', '冲突解决', '社交网络', '情感支持']
    };
    
    // 基于条目内容选择相关优势
    const allStrengths = strengthsMap[domain];
    return allStrengths.slice(0, Math.min(3, allStrengths.length));
  }

  // 获取改进领域
  private getAreasForImprovement(domain: ProfessionalDomain, entries: JournalEntry[]): string[] {
    const improvementMap: Record<ProfessionalDomain, string[]> = {
      'mental-health': ['压力管理', '情绪调节', '自我关怀', '社交支持', '应对策略'],
      'career': ['职业规划', '技能发展', '工作生活平衡', '网络建设', '沟通技巧'],
      'finance': ['投资知识', '预算制定', '债务管理', '财务目标', '消费习惯'],
      'health': ['运动频率', '饮食习惯', '睡眠质量', '压力管理', '健康检查'],
      'education': ['学习计划', '时间管理', '学习方法', '知识应用', '目标设定'],
      'relationships': ['沟通技巧', '冲突解决', '边界设定', '社交活动', '情感表达']
    };
    
    return improvementMap[domain].slice(0, Math.min(3, improvementMap[domain].length));
  }

  // 获取领域建议
  private getDomainRecommendations(domain: ProfessionalDomain, entries: JournalEntry[]): string[] {
    const recommendationsMap: Record<ProfessionalDomain, string[]> = {
      'mental-health': ['尝试每日冥想10分钟', '建立情绪日记', '寻求专业心理咨询', '增加社交活动', '学习压力管理技巧'],
      'career': ['制定详细的职业发展计划', '参加相关技能培训', '拓展专业网络', '寻求导师指导', '平衡工作与生活'],
      'finance': ['创建月度预算计划', '建立应急基金', '学习基础投资知识', '设定明确的财务目标', '定期审查支出习惯'],
      'health': ['每周至少运动3次', '改善饮食习惯', '保证充足睡眠', '定期健康检查', '学习压力管理技巧'],
      'education': ['制定结构化学习计划', '使用主动学习方法', '定期复习所学知识', '寻找学习伙伴', '设定明确的学习目标'],
      'relationships': ['定期与重要他人沟通', '学习有效沟通技巧', '设定健康的人际关系边界', '参加社交活动', '表达感激之情']
    };
    
    return recommendationsMap[domain].slice(0, Math.min(3, recommendationsMap[domain].length));
  }

  // 获取领域洞察
  private getDomainInsights(domain: ProfessionalDomain, entries: JournalEntry[]): string[] {
    const insightsMap: Record<ProfessionalDomain, string[]> = {
      'mental-health': ['情绪模式与特定事件相关', '社交支持对情绪状态有显著影响', '自我关怀活动能有效改善情绪', '睡眠质量与情绪状态密切相关', '运动对情绪有积极影响'],
      'career': ['工作满意度与个人价值观一致性相关', '技能发展与职业成长正相关', '工作环境对生产力有显著影响', '工作生活平衡对整体幸福感至关重要', '职业目标清晰度与职业满意度相关'],
      'finance': ['消费习惯与情绪状态相关', '财务压力会影响其他生活领域', '财务规划能减轻焦虑', '储蓄习惯与财务安全感相关', '投资知识与财务增长相关'],
      'health': ['运动习惯与情绪状态正相关', '饮食习惯影响能量水平', '睡眠质量与整体健康密切相关', '压力管理对健康至关重要', '社交活动对健康有积极影响'],
      'education': ['学习方法与学习效果密切相关', '学习环境影响专注度', '目标设定能提高学习动力', '休息对学习效果有积极影响', '学习伙伴能增强学习体验'],
      'relationships': ['沟通质量与关系满意度相关', '边界设定能减少冲突', '感恩表达能增强关系', '共同活动能增进连接', '冲突解决技巧对关系健康至关重要']
    };
    
    return insightsMap[domain].slice(0, Math.min(3, insightsMap[domain].length));
  }

  // 生成行动项
  private generateActionItems(domain: ProfessionalDomain, entries: JournalEntry[]): ActionItem[] {
    const actionItemsMap: Record<ProfessionalDomain, Omit<ActionItem, 'id' | 'completed'>> = {
      'mental-health': {
        title: '开始每日冥想练习',
        description: '每天早上或晚上花10分钟进行冥想，关注呼吸，培养正念意识',
        priority: 'medium',
        domain
      },
      'career': {
        title: '更新职业发展计划',
        description: '制定详细的职业目标和实现步骤，包括短期和长期目标',
        priority: 'high',
        domain
      },
      'finance': {
        title: '创建月度预算',
        description: '分析上月支出，制定本月预算计划，控制非必要开支',
        priority: 'high',
        domain
      },
      'health': {
        title: '建立规律运动习惯',
        description: '每周至少运动3次，每次30分钟，选择适合自己的运动方式',
        priority: 'medium',
        domain
      },
      'education': {
        title: '制定学习计划',
        description: '根据学习目标，制定详细的学习计划，包括时间安排和学习内容',
        priority: 'medium',
        domain
      },
      'relationships': {
        title: '增强沟通技巧',
        description: '学习并实践有效沟通技巧，特别是在冲突情境中',
        priority: 'medium',
        domain
      }
    };
    
    return [actionItemsMap[domain]].map(item => ({
      ...item,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false
    }));
  }

  // 获取专业领域资源
  async getDomainResources(domain: ProfessionalDomain): Promise<DomainResource[]> {
    const resourcesMap: Record<ProfessionalDomain, Omit<DomainResource, 'id' | 'relevanceScore'>> = {
      'mental-health': {
        title: '心理健康自助指南',
        type: 'article',
        url: 'https://example.com/mental-health-guide',
        description: '全面的心理健康自助资源，包括情绪管理技巧和自我关怀方法',
        domain
      },
      'career': {
        title: '职业发展规划工具',
        type: 'tool',
        url: 'https://example.com/career-planner',
        description: '帮助制定职业发展计划的在线工具，包括技能评估和目标设定',
        domain
      },
      'finance': {
        title: '个人理财基础课程',
        type: 'course',
        url: 'https://example.com/finance-course',
        description: '适合初学者的个人理财课程，涵盖预算、储蓄和投资基础知识',
        domain
      },
      'health': {
        title: '健康生活方式指南',
        type: 'article',
        url: 'https://example.com/healthy-living',
        description: '全面的健康生活方式指南，包括饮食、运动和睡眠建议',
        domain
      },
      'education': {
        title: '高效学习方法视频系列',
        type: 'video',
        url: 'https://example.com/learning-methods',
        description: '介绍各种高效学习方法的视频系列，帮助提高学习效果',
        domain
      },
      'relationships': {
        title: '有效沟通技巧 podcast',
        type: 'podcast',
        url: 'https://example.com/communication-skills',
        description: '关于有效沟通技巧的播客系列，帮助改善人际关系',
        domain
      }
    };
    
    return [resourcesMap[domain]].map(resource => ({
      ...resource,
      id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      relevanceScore: Math.random() * 30 + 70 // 70-100的随机分数
    }));
  }

  // 获取专业领域专家
  async getDomainExperts(domain: ProfessionalDomain): Promise<DomainExpert[]> {
    const expertsMap: Record<ProfessionalDomain, Omit<DomainExpert, 'id' | 'rating'>> = {
      'mental-health': {
        name: '张心理医生',
        title: '临床心理学家',
        expertise: ['焦虑障碍', '抑郁', '压力管理', '正念疗法'],
        bio: '拥有10年临床经验，专注于焦虑和抑郁的治疗，擅长正念疗法和认知行为疗法',
        domain,
        contactInfo: {
          email: 'zhang@example.com',
          website: 'https://example.com/zhang',
          social: 'https://example.com/social/zhang'
        }
      },
      'career': {
        name: '李职业顾问',
        title: '职业发展教练',
        expertise: ['职业规划', '简历优化', '面试技巧', '领导力发展'],
        bio: '前人力资源总监，拥有15年职业咨询经验，帮助数百人实现职业目标',
        domain,
        contactInfo: {
          email: 'li@example.com',
          website: 'https://example.com/li',
          social: 'https://example.com/social/li'
        }
      },
      'finance': {
        name: '王财务顾问',
        title: '认证财务规划师',
        expertise: ['个人理财', '投资规划', '退休计划', '税务优化'],
        bio: '拥有CFP认证，12年财务规划经验，专注于个人和家庭财务规划',
        domain,
        contactInfo: {
          email: 'wang@example.com',
          website: 'https://example.com/wang',
          social: 'https://example.com/social/wang'
        }
      },
      'health': {
        name: '刘健康教练',
        title: '健康生活方式专家',
        expertise: ['营养', '运动', '睡眠', '压力管理'],
        bio: '拥有健康教练认证，专注于帮助人们建立可持续的健康生活方式',
        domain,
        contactInfo: {
          email: 'liu@example.com',
          website: 'https://example.com/liu',
          social: 'https://example.com/social/liu'
        }
      },
      'education': {
        name: '陈教育专家',
        title: '学习策略顾问',
        expertise: ['学习方法', '时间管理', '考试准备', '教育规划'],
        bio: '前高中教师，拥有教育心理学硕士学位，专注于帮助学生提高学习效果',
        domain,
        contactInfo: {
          email: 'chen@example.com',
          website: 'https://example.com/chen',
          social: 'https://example.com/social/chen'
        }
      },
      'relationships': {
        name: '赵关系顾问',
        title: '人际关系专家',
        expertise: ['沟通技巧', '冲突解决', '边界设定', '关系修复'],
        bio: '拥有婚姻与家庭治疗硕士学位，专注于帮助人们改善人际关系',
        domain,
        contactInfo: {
          email: 'zhao@example.com',
          website: 'https://example.com/zhao',
          social: 'https://example.com/social/zhao'
        }
      }
    };
    
    return [expertsMap[domain]].map(expert => ({
      ...expert,
      id: `expert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rating: Math.random() * 1 + 4 // 4.0-5.0的随机评分
    }));
  }

  // 更新行动项状态
  async updateActionItem(actionItemId: string, updates: Partial<ActionItem>): Promise<void> {
    try {
      // 在实际应用中，这里会更新存储中的行动项
      console.log(`Updating action item ${actionItemId} with:`, updates);
    } catch (error) {
      console.error('Error updating action item:', error);
      throw error;
    }
  }

  // 获取所有行动项
  async getAllActionItems(): Promise<ActionItem[]> {
    try {
      // 在实际应用中，这里会从存储中获取所有行动项
      return [];
    } catch (error) {
      console.error('Error getting action items:', error);
      return [];
    }
  }
}

export const professionalService = new ProfessionalService();
