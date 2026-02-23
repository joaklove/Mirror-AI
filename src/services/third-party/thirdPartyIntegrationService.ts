// 第三方服务集成服务
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';
import { HealthRecord, FinancialRecord, LearningRecord, WorkRecord } from '../dataIntegrationService';

// 服务类型定义
export type ServiceType = 'health' | 'financial' | 'learning' | 'work' | 'smart_home';

// 服务状态定义
export type ServiceStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// 第三方服务接口
export interface ThirdPartyService {
  id: string;
  name: string;
  type: ServiceType;
  provider: string;
  status: ServiceStatus;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  user_id: string;
  metadata?: Record<string, any>;
  connected_at?: string;
  last_sync_at?: string;
  error_message?: string;
}

// 同步任务接口
export interface SyncTask {
  id: string;
  service_id: string;
  service_name: string;
  service_type: ServiceType;
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  sync_data?: Record<string, any>;
}

// 健康服务提供商
export const HEALTH_PROVIDERS = [
  { id: 'apple-health', name: 'Apple Health', logo: 'apple-health.svg' },
  { id: 'fitbit', name: 'Fitbit', logo: 'fitbit.svg' },
  { id: 'garmin', name: 'Garmin', logo: 'garmin.svg' },
  { id: 'strava', name: 'Strava', logo: 'strava.svg' },
  { id: 'withings', name: 'Withings', logo: 'withings.svg' },
  { id: 'google-fit', name: 'Google Fit', logo: 'google-fit.svg' },
  { id: 'samsung-health', name: 'Samsung Health', logo: 'samsung-health.svg' },
];

// 财务服务提供商
export const FINANCIAL_PROVIDERS = [
  { id: 'alipay', name: '支付宝', logo: 'alipay.svg' },
  { id: 'wechat-pay', name: '微信支付', logo: 'wechat-pay.svg' },
  { id: 'bank-of-china', name: '中国银行', logo: 'bank-of-china.svg' },
  { id: 'icbc', name: '工商银行', logo: 'icbc.svg' },
  { id: 'ccb', name: '建设银行', logo: 'ccb.svg' },
  { id: 'alipayhk', name: '支付宝HK', logo: 'alipayhk.svg' },
];

// 学习和工作服务提供商
export const LEARNING_WORK_PROVIDERS = [
  { id: 'notion', name: 'Notion', logo: 'notion.svg' },
  { id: 'todoist', name: 'Todoist', logo: 'todoist.svg' },
  { id: 'github', name: 'GitHub', logo: 'github.svg' },
  { id: 'google-calendar', name: 'Google Calendar', logo: 'google-calendar.svg' },
  { id: 'microsoft-outlook', name: 'Microsoft Outlook', logo: 'microsoft-outlook.svg' },
  { id: 'slack', name: 'Slack', logo: 'slack.svg' },
  { id: 'trello', name: 'Trello', logo: 'trello.svg' },
  { id: 'asana', name: 'Asana', logo: 'asana.svg' },
];

// 智能家居服务提供商
export const SMART_HOME_PROVIDERS = [
  { id: 'philips-hue', name: 'Philips Hue', logo: 'philips-hue.svg' },
  { id: 'nest', name: 'Google Nest', logo: 'nest.svg' },
  { id: 'smartthings', name: 'SmartThings', logo: 'smartthings.svg' },
  { id: 'homekit', name: 'Apple HomeKit', logo: 'homekit.svg' },
  { id: 'alexa', name: 'Amazon Alexa', logo: 'alexa.svg' },
  { id: 'google-home', name: 'Google Home', logo: 'google-home.svg' },
];

// 第三方服务集成服务
export const thirdPartyIntegrationService = {
  // 获取用户的所有第三方服务
  async getUserServices(): Promise<ThirdPartyService[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('third_party_services')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  // 获取特定类型的服务
  async getServicesByType(type: ServiceType): Promise<ThirdPartyService[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('third_party_services')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type);

    if (error) throw error;
    return data || [];
  },

  // 连接第三方服务
  async connectService(provider: string, type: ServiceType, authData: Record<string, any>): Promise<ThirdPartyService> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const serviceName = this.getServiceName(provider, type);

    const serviceData: ThirdPartyService = {
      id: serviceId,
      name: serviceName,
      type,
      provider,
      status: 'connected',
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_at: authData.expires_at,
      user_id: user.id,
      metadata: authData.metadata,
      connected_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('third_party_services')
      .insert(serviceData);

    if (error) throw error;

    // 立即同步数据
    await this.syncServiceData(serviceId);

    return serviceData;
  },

  // 断开第三方服务
  async disconnectService(serviceId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('third_party_services')
      .update({ status: 'disconnected', access_token: null, refresh_token: null })
      .eq('id', serviceId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  },

  // 同步服务数据
  async syncServiceData(serviceId: string): Promise<SyncTask> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取服务信息
    const { data: service, error: serviceError } = await supabase
      .from('third_party_services')
      .select('*')
      .eq('id', serviceId)
      .eq('user_id', user.id)
      .single();

    if (serviceError || !service) throw new Error('Service not found');

    // 创建同步任务
    const taskId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const syncTask: SyncTask = {
      id: taskId,
      service_id: serviceId,
      service_name: service.name,
      service_type: service.type,
      user_id: user.id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    };

    // 保存任务到数据库
    await supabase
      .from('sync_tasks')
      .insert(syncTask);

    try {
      // 根据服务类型执行不同的同步逻辑
      let syncResult: any;
      switch (service.type) {
        case 'health':
          syncResult = await this.syncHealthData(service);
          break;
        case 'financial':
          syncResult = await this.syncFinancialData(service);
          break;
        case 'learning':
        case 'work':
          syncResult = await this.syncLearningWorkData(service);
          break;
        case 'smart_home':
          syncResult = await this.syncSmartHomeData(service);
          break;
        default:
          throw new Error('Unsupported service type');
      }

      // 更新同步任务状态
      await supabase
        .from('sync_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          sync_data: syncResult,
        })
        .eq('id', taskId);

      // 更新服务最后同步时间
      await supabase
        .from('third_party_services')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', serviceId);

      return {
        ...syncTask,
        status: 'completed',
        completed_at: new Date().toISOString(),
        sync_data: syncResult,
      };
    } catch (error) {
      // 更新同步任务状态为失败
      await supabase
        .from('sync_tasks')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', taskId);

      // 更新服务状态为错误
      await supabase
        .from('third_party_services')
        .update({ 
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', serviceId);

      throw error;
    }
  },

  // 同步健康数据
  async syncHealthData(service: ThirdPartyService): Promise<Record<string, any>> {
    // 模拟不同健康服务的数据同步
    let healthData: HealthRecord[] = [];

    switch (service.provider) {
      case 'apple-health':
        healthData = await this.syncAppleHealthData(service);
        break;
      case 'fitbit':
        healthData = await this.syncFitbitData(service);
        break;
      case 'garmin':
        healthData = await this.syncGarminData(service);
        break;
      case 'strava':
        healthData = await this.syncStravaData(service);
        break;
      case 'withings':
        healthData = await this.syncWithingsData(service);
        break;
      default:
        // 通用健康数据模拟
        healthData = this.generateMockHealthData(service.user_id);
    }

    // 保存健康数据
    if (healthData.length > 0) {
      await supabase
        .from('health_records')
        .insert(healthData);
    }

    return { total_records: healthData.length, records: healthData };
  },

  // 同步财务数据
  async syncFinancialData(service: ThirdPartyService): Promise<Record<string, any>> {
    // 模拟不同财务服务的数据同步
    let financialData: FinancialRecord[] = [];

    switch (service.provider) {
      case 'alipay':
        financialData = await this.syncAlipayData(service);
        break;
      case 'wechat-pay':
        financialData = await this.syncWechatPayData(service);
        break;
      case 'bank-of-china':
      case 'icbc':
      case 'ccb':
        financialData = await this.syncBankData(service);
        break;
      default:
        // 通用财务数据模拟
        financialData = this.generateMockFinancialData(service.user_id);
    }

    // 保存财务数据
    if (financialData.length > 0) {
      await supabase
        .from('financial_records')
        .insert(financialData);
    }

    return { total_records: financialData.length, records: financialData };
  },

  // 同步学习和工作数据
  async syncLearningWorkData(service: ThirdPartyService): Promise<Record<string, any>> {
    // 模拟不同学习和工作服务的数据同步
    let learningData: LearningRecord[] = [];
    let workData: WorkRecord[] = [];

    switch (service.provider) {
      case 'notion':
        workData = await this.syncNotionData(service);
        break;
      case 'todoist':
        workData = await this.syncTodoistData(service);
        break;
      case 'github':
        workData = await this.syncGitHubData(service);
        break;
      default:
        // 通用工作数据模拟
        workData = this.generateMockWorkData(service.user_id);
    }

    // 保存学习数据
    if (learningData.length > 0) {
      await supabase
        .from('learning_records')
        .insert(learningData);
    }

    // 保存工作数据
    if (workData.length > 0) {
      await supabase
        .from('work_records')
        .insert(workData);
    }

    return { 
      total_learning_records: learningData.length, 
      total_work_records: workData.length,
      learning_records: learningData,
      work_records: workData
    };
  },

  // 同步智能家居数据
  async syncSmartHomeData(service: ThirdPartyService): Promise<Record<string, any>> {
    // 模拟智能家居数据同步
    const smartHomeData = this.generateMockSmartHomeData(service.user_id);

    // 保存智能家居数据
    if (smartHomeData.length > 0) {
      await supabase
        .from('smart_home_devices')
        .insert(smartHomeData);
    }

    return { total_devices: smartHomeData.length, devices: smartHomeData };
  },

  // 模拟 Apple Health 数据同步
  async syncAppleHealthData(service: ThirdPartyService): Promise<HealthRecord[]> {
    // 模拟 Apple Health API 调用
    return this.generateMockHealthData(service.user_id, 'apple-health');
  },

  // 模拟 Fitbit 数据同步
  async syncFitbitData(service: ThirdPartyService): Promise<HealthRecord[]> {
    // 模拟 Fitbit API 调用
    return this.generateMockHealthData(service.user_id, 'fitbit');
  },

  // 模拟 Garmin 数据同步
  async syncGarminData(service: ThirdPartyService): Promise<HealthRecord[]> {
    // 模拟 Garmin API 调用
    return this.generateMockHealthData(service.user_id, 'garmin');
  },

  // 模拟 Strava 数据同步
  async syncStravaData(service: ThirdPartyService): Promise<HealthRecord[]> {
    // 模拟 Strava API 调用
    return this.generateMockHealthData(service.user_id, 'strava');
  },

  // 模拟 Withings 数据同步
  async syncWithingsData(service: ThirdPartyService): Promise<HealthRecord[]> {
    // 模拟 Withings API 调用
    return this.generateMockHealthData(service.user_id, 'withings');
  },

  // 模拟支付宝数据同步
  async syncAlipayData(service: ThirdPartyService): Promise<FinancialRecord[]> {
    // 模拟支付宝 API 调用
    return this.generateMockFinancialData(service.user_id, 'alipay');
  },

  // 模拟微信支付数据同步
  async syncWechatPayData(service: ThirdPartyService): Promise<FinancialRecord[]> {
    // 模拟微信支付 API 调用
    return this.generateMockFinancialData(service.user_id, 'wechat-pay');
  },

  // 模拟银行数据同步
  async syncBankData(service: ThirdPartyService): Promise<FinancialRecord[]> {
    // 模拟银行 API 调用
    return this.generateMockFinancialData(service.user_id, service.provider);
  },

  // 模拟 Notion 数据同步
  async syncNotionData(service: ThirdPartyService): Promise<WorkRecord[]> {
    // 模拟 Notion API 调用
    return this.generateMockWorkData(service.user_id, 'notion');
  },

  // 模拟 Todoist 数据同步
  async syncTodoistData(service: ThirdPartyService): Promise<WorkRecord[]> {
    // 模拟 Todoist API 调用
    return this.generateMockWorkData(service.user_id, 'todoist');
  },

  // 模拟 GitHub 数据同步
  async syncGitHubData(service: ThirdPartyService): Promise<WorkRecord[]> {
    // 模拟 GitHub API 调用
    return this.generateMockWorkData(service.user_id, 'github');
  },

  // 生成模拟健康数据
  generateMockHealthData(userId: string, provider?: string): HealthRecord[] {
    const records: HealthRecord[] = [];
    const now = new Date();

    // 生成过去7天的健康数据
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // 睡眠数据
      records.push({
        id: `health_${Date.now()}_${i}_1`,
        user_id: userId,
        type: 'sleep',
        value: 6 + Math.random() * 3, // 6-9小时
        unit: 'hours',
        timestamp: date.toISOString(),
        metadata: { provider, quality: ['good', 'fair', 'poor'][Math.floor(Math.random() * 3)] },
      });

      // 运动数据
      records.push({
        id: `health_${Date.now()}_${i}_2`,
        user_id: userId,
        type: 'exercise',
        value: 30 + Math.random() * 60, // 30-90分钟
        unit: 'minutes',
        timestamp: date.toISOString(),
        metadata: { provider, type: ['walking', 'running', 'cycling', 'swimming'][Math.floor(Math.random() * 4)] },
      });

      // 饮食数据
      records.push({
        id: `health_${Date.now()}_${i}_3`,
        user_id: userId,
        type: 'diet',
        value: 1800 + Math.random() * 600, // 1800-2400卡路里
        unit: 'calories',
        timestamp: date.toISOString(),
        metadata: { provider, quality: ['healthy', 'balanced', 'unhealthy'][Math.floor(Math.random() * 3)] },
      });
    }

    return records;
  },

  // 生成模拟财务数据
  generateMockFinancialData(userId: string, provider?: string): FinancialRecord[] {
    const records: FinancialRecord[] = [];
    const now = new Date();
    const categories = ['food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'education'];

    // 生成过去30天的财务数据
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // 随机生成支出
      if (Math.random() > 0.3) { // 70% 概率生成支出
        records.push({
          id: `fin_${Date.now()}_${i}_1`,
          user_id: userId,
          type: 'expense',
          amount: 10 + Math.random() * 200, // 10-200元
          currency: 'CNY',
          category: categories[Math.floor(Math.random() * categories.length)],
          timestamp: date.toISOString(),
          description: `Expense at ${provider || 'unknown'}`,
        });
      }

      // 随机生成收入
      if (i % 7 === 0) { // 每周生成一次收入
        records.push({
          id: `fin_${Date.now()}_${i}_2`,
          user_id: userId,
          type: 'income',
          amount: 1000 + Math.random() * 4000, // 1000-5000元
          currency: 'CNY',
          category: 'salary',
          timestamp: date.toISOString(),
          description: `Salary from ${provider || 'employer'}`,
        });
      }
    }

    return records;
  },

  // 生成模拟工作数据
  generateMockWorkData(userId: string, provider?: string): WorkRecord[] {
    const records: WorkRecord[] = [];
    const now = new Date();
    const tasks = [
      'Complete project proposal',
      'Review team performance',
      'Update documentation',
      'Fix bugs in production',
      'Prepare meeting agenda',
      'Research new technologies',
      'Collaborate with design team',
      'Optimize database queries',
    ];
    const statuses: ('todo' | 'in_progress' | 'completed')[] = ['todo', 'in_progress', 'completed'];
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

    // 生成10个工作任务
    for (let i = 0; i < 10; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 14));

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const completedAt = status === 'completed' ? new Date(date.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined;

      records.push({
        id: `work_${Date.now()}_${i}`,
        user_id: userId,
        task_name: tasks[Math.floor(Math.random() * tasks.length)],
        project: `Project ${Math.floor(Math.random() * 5) + 1}`,
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        estimated_time: 1 + Math.random() * 4, // 1-5小时
        actual_time: status === 'completed' ? 1 + Math.random() * 4 : undefined,
        created_at: date.toISOString(),
        completed_at: completedAt,
      });
    }

    return records;
  },

  // 生成模拟智能家居数据
  generateMockSmartHomeData(userId: string): any[] {
    const devices: any[] = [];
    const deviceTypes = ['light', 'thermostat', 'camera', 'lock', 'speaker'];
    const locations = ['living room', 'bedroom', 'kitchen', 'bathroom', 'garage'];

    // 生成5个智能设备
    for (let i = 0; i < 5; i++) {
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      devices.push({
        id: `device_${Date.now()}_${i}`,
        user_id: userId,
        name: `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} ${locations[Math.floor(Math.random() * locations.length)]}`,
        type: deviceType,
        location: locations[Math.floor(Math.random() * locations.length)],
        status: Math.random() > 0.3, // 70% 概率在线
        power: Math.random() > 0.5, // 50% 概率开启
        brightness: deviceType === 'light' ? Math.floor(Math.random() * 100) : undefined,
        temperature: deviceType === 'thermostat' ? 18 + Math.random() * 10 : undefined,
        volume: deviceType === 'speaker' ? Math.floor(Math.random() * 100) : undefined,
        last_updated: new Date().toISOString(),
      });
    }

    return devices;
  },

  // 获取服务名称
  getServiceName(provider: string, type: ServiceType): string {
    switch (type) {
      case 'health':
        return HEALTH_PROVIDERS.find(p => p.id === provider)?.name || provider;
      case 'financial':
        return FINANCIAL_PROVIDERS.find(p => p.id === provider)?.name || provider;
      case 'learning':
      case 'work':
        return LEARNING_WORK_PROVIDERS.find(p => p.id === provider)?.name || provider;
      case 'smart_home':
        return SMART_HOME_PROVIDERS.find(p => p.id === provider)?.name || provider;
      default:
        return provider;
    }
  },

  // 检查服务连接状态
  async checkServiceStatus(serviceId: string): Promise<ServiceStatus> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: service, error } = await supabase
      .from('third_party_services')
      .select('*')
      .eq('id', serviceId)
      .eq('user_id', user.id)
      .single();

    if (error || !service) return 'disconnected';

    // 检查 token 是否过期
    if (service.expires_at && service.expires_at < Date.now() / 1000) {
      return 'error';
    }

    return service.status;
  },

  // 刷新服务令牌
  async refreshServiceToken(serviceId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取服务信息
    const { data: service, error: serviceError } = await supabase
      .from('third_party_services')
      .select('*')
      .eq('id', serviceId)
      .eq('user_id', user.id)
      .single();

    if (serviceError || !service) throw new Error('Service not found');

    // 模拟刷新令牌
    const newToken = `new_token_${Date.now()}`;
    const newExpiresAt = Math.floor(Date.now() / 1000) + 3600 * 24 * 7; // 7天

    // 更新服务信息
    const { error } = await supabase
      .from('third_party_services')
      .update({
        access_token: newToken,
        expires_at: newExpiresAt,
        status: 'connected',
        error_message: null,
      })
      .eq('id', serviceId);

    if (error) throw error;
    return true;
  },

  // 获取服务同步历史
  async getServiceSyncHistory(serviceId: string, limit: number = 10): Promise<SyncTask[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sync_tasks')
      .select('*')
      .eq('service_id', serviceId)
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // 批量同步所有服务
  async syncAllServices(): Promise<SyncTask[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取所有已连接的服务
    const { data: services, error: servicesError } = await supabase
      .from('third_party_services')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected');

    if (servicesError) throw servicesError;

    // 并行同步所有服务
    const syncTasks = await Promise.all(
      (services || []).map(service => this.syncServiceData(service.id))
    );

    return syncTasks;
  },
};
