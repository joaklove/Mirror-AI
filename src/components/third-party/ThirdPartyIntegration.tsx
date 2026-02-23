import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  Book,
  Calendar,
  Clock,
  Cloud,
  CloudUpload,
  CreditCard,
  Database,
  Home,
  Key,
  Layers,
  Link,
  Link2,
  ListChecks,
  Loader2,
  LogOut,
  RefreshCw,
  Server,
  Settings,
  Wifi,
  X
} from 'lucide-react';
import {
  thirdPartyIntegrationService,
  ThirdPartyService,
  SyncTask,
  HEALTH_PROVIDERS,
  FINANCIAL_PROVIDERS,
  LEARNING_WORK_PROVIDERS,
  SMART_HOME_PROVIDERS,
  ServiceStatus
} from '@/services/third-party/thirdPartyIntegrationService';

// 服务图标映射
const SERVICE_ICONS = {
  health: Activity,
  financial: CreditCard,
  learning: Book,
  work: ListChecks,
  smart_home: Home
};

// 状态图标映射
const STATUS_ICONS = {
  disconnected: Link2,
  connecting: Loader2,
  connected: Link,
  error: X
};

// 状态颜色映射
const STATUS_COLORS = {
  disconnected: 'bg-gray-500',
  connecting: 'bg-yellow-500',
  connected: 'bg-green-500',
  error: 'bg-red-500'
};

const ThirdPartyIntegration: React.FC = () => {
  const [services, setServices] = useState<ThirdPartyService[]>([]);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('health');
  const [syncingService, setSyncingService] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 加载用户的第三方服务
  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const userServices = await thirdPartyIntegrationService.getUserServices();
      setServices(userServices);
    } catch (err) {
      setError('加载服务失败，请稍后重试');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载同步任务
  const loadSyncTasks = async () => {
    try {
      // 这里可以根据需要加载特定服务的同步任务
      // 暂时不实现，因为会增加复杂性
    } catch (err) {
      console.error('Error loading sync tasks:', err);
    }
  };

  // 初始加载
  useEffect(() => {
    loadServices();
    loadSyncTasks();
  }, []);

  // 连接服务
  const handleConnectService = async (provider: string, type: string) => {
    try {
      setError(null);
      // 模拟认证数据
      const authData = {
        access_token: `token_${Date.now()}_${provider}`,
        refresh_token: `refresh_${Date.now()}_${provider}`,
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7, // 7天
        metadata: {
          connected_via: 'Mirror AI',
          connection_time: new Date().toISOString()
        }
      };

      // 连接服务
      const newService = await thirdPartyIntegrationService.connectService(
        provider,
        type as any,
        authData
      );

      // 更新服务列表
      setServices(prev => [...prev, newService]);
    } catch (err) {
      setError('连接服务失败，请稍后重试');
      console.error('Error connecting service:', err);
    }
  };

  // 断开服务
  const handleDisconnectService = async (serviceId: string) => {
    try {
      setError(null);
      await thirdPartyIntegrationService.disconnectService(serviceId);
      // 更新服务列表
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status: 'disconnected' as ServiceStatus } 
          : service
      ));
    } catch (err) {
      setError('断开服务失败，请稍后重试');
      console.error('Error disconnecting service:', err);
    }
  };

  // 同步服务数据
  const handleSyncService = async (serviceId: string) => {
    try {
      setError(null);
      setSyncingService(serviceId);
      await thirdPartyIntegrationService.syncServiceData(serviceId);
      // 更新服务列表
      await loadServices();
    } catch (err) {
      setError('同步服务数据失败，请稍后重试');
      console.error('Error syncing service:', err);
    } finally {
      setSyncingService(null);
    }
  };

  // 批量同步所有服务
  const handleSyncAllServices = async () => {
    try {
      setError(null);
      setLoading(true);
      await thirdPartyIntegrationService.syncAllServices();
      // 更新服务列表
      await loadServices();
    } catch (err) {
      setError('同步所有服务失败，请稍后重试');
      console.error('Error syncing all services:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取服务类型的提供商列表
  const getProvidersByType = (type: string) => {
    switch (type) {
      case 'health':
        return HEALTH_PROVIDERS;
      case 'financial':
        return FINANCIAL_PROVIDERS;
      case 'learning':
      case 'work':
        return LEARNING_WORK_PROVIDERS;
      case 'smart_home':
        return SMART_HOME_PROVIDERS;
      default:
        return [];
    }
  };

  // 获取已连接的服务
  const getConnectedServicesByType = (type: string) => {
    return services.filter(service => service.type === type);
  };

  // 获取服务状态文本
  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case 'disconnected':
        return '未连接';
      case 'connecting':
        return '连接中';
      case 'connected':
        return '已连接';
      case 'error':
        return '连接错误';
      default:
        return '未知状态';
    }
  };

  // 渲染服务状态徽章
  const renderStatusBadge = (status: ServiceStatus) => {
    const StatusIcon = STATUS_ICONS[status];
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${STATUS_COLORS[status]} text-white`}>
        <StatusIcon className="h-3 w-3" />
        {getStatusText(status)}
      </Badge>
    );
  };

  // 渲染服务卡片
  const renderServiceCard = (service: ThirdPartyService) => {
    const ServiceIcon = SERVICE_ICONS[service.type];
    const isSyncing = syncingService === service.id;

    return (
      <Card key={service.id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ServiceIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{service.name}</CardTitle>
                <CardDescription>{service.provider}</CardDescription>
              </div>
            </div>
            {renderStatusBadge(service.status)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">连接时间</span>
              <span>{service.connected_at ? new Date(service.connected_at).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">最后同步</span>
              <span>{service.last_sync_at ? new Date(service.last_sync_at).toLocaleString() : 'N/A'}</span>
            </div>
            {service.error_message && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>连接错误</AlertTitle>
                <AlertDescription className="text-xs">{service.error_message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDisconnectService(service.id)}
            disabled={isSyncing}
          >
            <LogOut className="h-4 w-4 mr-1" />
            断开连接
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleSyncService(service.id)}
            disabled={isSyncing || service.status !== 'connected'}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                同步中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                同步数据
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // 渲染提供商卡片
  const renderProviderCard = (provider: any, type: string) => {
    const ServiceIcon = SERVICE_ICONS[type as keyof typeof SERVICE_ICONS];
    const isConnected = services.some(service => 
      service.provider === provider.id && service.type === type
    );

    return (
      <Card key={provider.id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ServiceIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{provider.name}</CardTitle>
              <CardDescription>{type === 'learning' || type === 'work' ? '学习/工作' : type === 'smart_home' ? '智能家居' : type}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="pt-2">
          {isConnected ? (
            <Button variant="outline" size="sm" disabled>
              <Link className="h-4 w-4 mr-1" />
              已连接
            </Button>
          ) : (
            <Button size="sm" onClick={() => handleConnectService(provider.id, type)}>
              <Link2 className="h-4 w-4 mr-1" />
              连接服务
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // 渲染服务列表
  const renderServiceList = (type: string) => {
    const connectedServices = getConnectedServicesByType(type);
    const providers = getProvidersByType(type);
    const availableProviders = providers.filter(provider => 
      !services.some(service => service.provider === provider.id && service.type === type)
    );

    return (
      <div className="space-y-6">
        {/* 已连接的服务 */}
        {connectedServices.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">已连接的服务</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedServices.map(service => renderServiceCard(service))}
            </div>
          </div>
        )}

        {/* 可用的服务 */}
        {availableProviders.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">可用的服务</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableProviders.map(provider => renderProviderCard(provider, type))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {connectedServices.length === 0 && availableProviders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">暂无服务</h3>
            <p className="text-muted-foreground mb-4">请连接第三方服务以获取更多功能</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">第三方服务集成</h1>
          <p className="text-muted-foreground">连接和管理您的第三方服务，实现数据同步和智能联动</p>
        </div>
        <Button 
          onClick={handleSyncAllServices}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              同步中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              同步所有服务
            </>
          )}
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>操作失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 服务统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">健康服务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{getConnectedServicesByType('health').length}</div>
              <div className="text-sm text-muted-foreground">/ {HEALTH_PROVIDERS.length}</div>
            </div>
            <Progress 
              value={(getConnectedServicesByType('health').length / HEALTH_PROVIDERS.length) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">财务服务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{getConnectedServicesByType('financial').length}</div>
              <div className="text-sm text-muted-foreground">/ {FINANCIAL_PROVIDERS.length}</div>
            </div>
            <Progress 
              value={(getConnectedServicesByType('financial').length / FINANCIAL_PROVIDERS.length) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">学习/工作服务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{getConnectedServicesByType('learning').length + getConnectedServicesByType('work').length}</div>
              <div className="text-sm text-muted-foreground">/ {LEARNING_WORK_PROVIDERS.length}</div>
            </div>
            <Progress 
              value={((getConnectedServicesByType('learning').length + getConnectedServicesByType('work').length) / LEARNING_WORK_PROVIDERS.length) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">智能家居服务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{getConnectedServicesByType('smart_home').length}</div>
              <div className="text-sm text-muted-foreground">/ {SMART_HOME_PROVIDERS.length}</div>
            </div>
            <Progress 
              value={(getConnectedServicesByType('smart_home').length / SMART_HOME_PROVIDERS.length) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* 服务标签页 */}
      <Tabs defaultValue="health" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">
            <Activity className="h-4 w-4 mr-1" />
            健康服务
          </TabsTrigger>
          <TabsTrigger value="financial">
            <CreditCard className="h-4 w-4 mr-1" />
            财务服务
          </TabsTrigger>
          <TabsTrigger value="learning">
            <Book className="h-4 w-4 mr-1" />
            学习/工作
          </TabsTrigger>
          <TabsTrigger value="smart_home">
            <Home className="h-4 w-4 mr-1" />
            智能家居
          </TabsTrigger>
        </TabsList>
        <TabsContent value="health" className="mt-4">
          {renderServiceList('health')}
        </TabsContent>
        <TabsContent value="financial" className="mt-4">
          {renderServiceList('financial')}
        </TabsContent>
        <TabsContent value="learning" className="mt-4">
          {renderServiceList('learning')}
          {renderServiceList('work')}
        </TabsContent>
        <TabsContent value="smart_home" className="mt-4">
          {renderServiceList('smart_home')}
        </TabsContent>
      </Tabs>

      {/* 同步历史 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">同步历史</h2>
        <Card>
          <CardHeader>
            <CardTitle>最近同步任务</CardTitle>
            <CardDescription>查看所有服务的同步历史记录</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>服务名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead>完成时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncTasks.length > 0 ? (
                    syncTasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell>{task.service_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.service_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              task.status === 'completed' ? 'default' :
                              task.status === 'failed' ? 'destructive' :
                              task.status === 'in_progress' ? 'secondary' : 'outline'
                            }
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(task.started_at).toLocaleString()}</TableCell>
                        <TableCell>{task.completed_at ? new Date(task.completed_at).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSyncService(task.service_id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        暂无同步历史
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThirdPartyIntegration;
