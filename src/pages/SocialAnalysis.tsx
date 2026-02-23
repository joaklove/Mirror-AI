import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { socialService, type User, type Connection, type Message, type Collaboration } from '@/services/socialService';
import { Users, MessageSquare, Users2, BarChart2, TrendingUp, Calendar, Clock, Mail, Share2, Heart } from 'lucide-react';

const SocialAnalysis: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [connectionStats, setConnectionStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0
  });
  const [messageStats, setMessageStats] = useState({
    total: 0,
    sent: 0,
    received: 0,
    unread: 0
  });
  const [collaborationStats, setCollaborationStats] = useState({
    total: 0,
    owned: 0,
    member: 0
  });

  useEffect(() => {
    if (currentUser) {
      loadSocialData();
    }
  }, [currentUser]);

  const loadSocialData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // 并行加载所有社交数据
      const [usersData, connectionsData, collaborationsData] = await Promise.all([
        socialService.getUsers(),
        socialService.getConnections(currentUser.id),
        socialService.getCollaborations(currentUser.id)
      ]);

      setUsers(usersData);
      setConnections(connectionsData);
      setCollaborations(collaborationsData);

      // 计算连接统计
      const totalConnections = connectionsData.length;
      const accepted = connectionsData.filter(conn => conn.status === 'accepted').length;
      const pending = connectionsData.filter(conn => conn.status === 'pending').length;
      const rejected = connectionsData.filter(conn => conn.status === 'rejected').length;

      setConnectionStats({ total: totalConnections, accepted, pending, rejected });

      // 计算协作统计
      const totalCollaborations = collaborationsData.length;
      const owned = collaborationsData.filter(collab => 
        collab.members.some(member => member.userId === currentUser.id && member.role === 'owner')
      ).length;
      const member = collaborationsData.filter(collab => 
        collab.members.some(member => member.userId === currentUser.id && member.role !== 'owner')
      ).length;

      setCollaborationStats({ total: totalCollaborations, owned, member });

      // 加载所有消息
      const allMessages: Message[] = [];
      for (const user of usersData) {
        if (user.id !== currentUser.id) {
          const userMessages = await socialService.getMessages(currentUser.id, user.id);
          allMessages.push(...userMessages);
        }
      }
      setMessages(allMessages);

      // 计算消息统计
      const totalMessages = allMessages.length;
      const sent = allMessages.filter(msg => msg.senderId === currentUser.id).length;
      const received = allMessages.filter(msg => msg.receiverId === currentUser.id).length;
      const unread = allMessages.filter(msg => msg.receiverId === currentUser.id && msg.status !== 'read').length;

      setMessageStats({ total: totalMessages, sent, received, unread });
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionRate = () => {
    if (users.length === 0) return 0;
    return Math.round((connectionStats.accepted / users.length) * 100);
  };

  const getMessageResponseRate = () => {
    if (messageStats.received === 0) return 0;
    return Math.round((messageStats.sent / messageStats.received) * 100);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载社交分析数据中...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <Users2 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">社交分析</h1>
      </div>

      {/* 社交概览卡片 */}
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle>社交概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 连接统计 */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">连接</h4>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">总数</span>
                  <span className="font-semibold">{connectionStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">已接受</span>
                  <span className="font-semibold">{connectionStats.accepted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">待处理</span>
                  <span className="font-semibold">{connectionStats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">连接率</span>
                  <span className="font-semibold">{getConnectionRate()}%</span>
                </div>
              </div>
            </div>

            {/* 消息统计 */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">消息</h4>
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">总数</span>
                  <span className="font-semibold">{messageStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">已发送</span>
                  <span className="font-semibold">{messageStats.sent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">已接收</span>
                  <span className="font-semibold">{messageStats.received}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">回复率</span>
                  <span className="font-semibold">{getMessageResponseRate()}%</span>
                </div>
              </div>
            </div>

            {/* 协作统计 */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">协作</h4>
                <Users2 className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">总数</span>
                  <span className="font-semibold">{collaborationStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">拥有</span>
                  <span className="font-semibold">{collaborationStats.owned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">参与</span>
                  <span className="font-semibold">{collaborationStats.member}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">成员数</span>
                  <span className="font-semibold">
                    {collaborations.reduce((total, collab) => total + collab.members.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 社交分析标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="connections">连接</TabsTrigger>
          <TabsTrigger value="messages">消息</TabsTrigger>
          <TabsTrigger value="collaborations">协作</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 社交活动趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>社交活动趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">活动趋势图表将在此显示</p>
              </div>
            </CardContent>
          </Card>

          {/* 最近社交活动 */}
          <Card>
            <CardHeader>
              <CardTitle>最近社交活动</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {/* 最近连接 */}
                  <div>
                    <h4 className="font-medium mb-3">最近连接</h4>
                    {connections.slice(0, 5).map((connection) => {
                      const otherUserId = connection.userId === currentUser?.id ? connection.connectedUserId : connection.userId;
                      const user = users.find(u => u.id === otherUserId);

                      if (!user) return null;

                      return (
                        <div key={connection.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {connection.status === 'accepted' ? '已连接' : 
                                 connection.status === 'pending' ? '待处理' : '已拒绝'}
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            connection.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            connection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {connection.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* 最近协作 */}
                  <div>
                    <h4 className="font-medium mb-3">最近协作</h4>
                    {collaborations.slice(0, 5).map((collaboration) => {
                      const isOwner = collaboration.members.some(
                        member => member.userId === currentUser?.id && member.role === 'owner'
                      );

                      return (
                        <div key={collaboration.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                          <div>
                            <p className="font-medium">{collaboration.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {isOwner ? '所有者' : '成员'} • {collaboration.members.length} 成员
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {collaboration.members.length} 成员
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 连接标签页 */}
        <TabsContent value="connections" className="space-y-6">
          {/* 连接统计 */}
          <Card>
            <CardHeader>
              <CardTitle>连接统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3">连接状态</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">已接受</span>
                        <span className="text-sm font-medium">{connectionStats.accepted}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${connectionStats.total > 0 ? (connectionStats.accepted / connectionStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">待处理</span>
                        <span className="text-sm font-medium">{connectionStats.pending}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${connectionStats.total > 0 ? (connectionStats.pending / connectionStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">已拒绝</span>
                        <span className="text-sm font-medium">{connectionStats.rejected}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${connectionStats.total > 0 ? (connectionStats.rejected / connectionStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 连接列表 */}
                <div>
                  <h4 className="font-medium mb-3">所有连接</h4>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {connections.map((connection) => {
                        const otherUserId = connection.userId === currentUser?.id ? connection.connectedUserId : connection.userId;
                        const user = users.find(u => u.id === otherUserId);

                        if (!user) return null;

                        return (
                          <div key={connection.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                connection.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                connection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {connection.status}
                              </Badge>
                              <Button size="sm" variant="secondary">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 消息标签页 */}
        <TabsContent value="messages" className="space-y-6">
          {/* 消息统计 */}
          <Card>
            <CardHeader>
              <CardTitle>消息统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3">消息数量</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">总数</span>
                      <span className="font-semibold">{messageStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">已发送</span>
                      <span className="font-semibold">{messageStats.sent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">已接收</span>
                      <span className="font-semibold">{messageStats.received}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">未读</span>
                      <span className="font-semibold">{messageStats.unread}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3">消息统计</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">回复率</span>
                      <span className="font-semibold">{getMessageResponseRate()}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">平均消息长度</span>
                      <span className="font-semibold">--</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">最活跃的聊天</span>
                      <span className="font-semibold">--</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 消息历史 */}
          <Card>
            <CardHeader>
              <CardTitle>消息历史</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {messages.slice(0, 10).map((message) => {
                    const isSent = message.senderId === currentUser?.id;
                    const otherUserId = isSent ? message.receiverId : message.senderId;
                    const user = users.find(u => u.id === otherUserId);

                    if (!user) return null;

                    return (
                      <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${isSent ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="text-xs font-medium">{user.name}</p>
                          </div>
                          <p className="mb-1">{message.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 协作标签页 */}
        <TabsContent value="collaborations" className="space-y-6">
          {/* 协作统计 */}
          <Card>
            <CardHeader>
              <CardTitle>协作统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg mb-6">
                <h4 className="font-medium mb-3">协作项目</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">总数</span>
                    <span className="font-semibold">{collaborationStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">拥有</span>
                    <span className="font-semibold">{collaborationStats.owned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">参与</span>
                    <span className="font-semibold">{collaborationStats.member}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">总成员数</span>
                    <span className="font-semibold">
                      {collaborations.reduce((total, collab) => total + collab.members.length, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 协作列表 */}
              <div>
                <h4 className="font-medium mb-3">协作项目</h4>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {collaborations.map((collaboration) => {
                      const isOwner = collaboration.members.some(
                        member => member.userId === currentUser?.id && member.role === 'owner'
                      );

                      return (
                        <div key={collaboration.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium">{collaboration.title}</h5>
                              <p className="text-sm text-muted-foreground mb-3">{collaboration.description}</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {collaboration.members.slice(0, 3).map((member, index) => {
                                  const memberUser = users.find(u => u.id === member.userId);
                                  return (
                                    <Badge key={index} variant="secondary">
                                      {memberUser?.name || member.userId} ({member.role})
                                    </Badge>
                                  );
                                })}
                                {collaboration.members.length > 3 && (
                                  <Badge variant="secondary">+{collaboration.members.length - 3}</Badge>
                                )}
                              </div>
                            </div>
                            <Badge className={isOwner ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {isOwner ? '所有者' : '成员'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(collaboration.createdAt).toLocaleDateString()}</span>
                            </div>
                            <Button size="sm">
                              <Share2 className="h-4 w-4 mr-1" />
                              查看详情
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialAnalysis;
