import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { socialService, type User, type Connection, type Message, type Collaboration } from '@/services/socialService';
import { Users, MessageSquare, Users2, Send, Search, Plus, Check, X, Clock, Mail, Share2, UserPlus, UserMinus } from 'lucide-react';

const SocialDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [showCreateCollaboration, setShowCreateCollaboration] = useState(false);
  const [collaborationTitle, setCollaborationTitle] = useState('');
  const [collaborationDescription, setCollaborationDescription] = useState('');
  const [loading, setLoading] = useState(true);

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

      setUsers(usersData.filter(user => user.id !== currentUser.id));
      setConnections(connectionsData);
      setCollaborations(collaborationsData);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (targetUserId: string) => {
    if (!currentUser) return;

    try {
      await socialService.sendConnectionRequest(currentUser.id, targetUserId);
      // 重新加载连接数据
      const connectionsData = await socialService.getConnections(currentUser.id);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      await socialService.acceptConnectionRequest(connectionId);
      // 重新加载连接数据
      if (currentUser) {
        const connectionsData = await socialService.getConnections(currentUser.id);
        setConnections(connectionsData);
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    try {
      await socialService.rejectConnectionRequest(connectionId);
      // 重新加载连接数据
      if (currentUser) {
        const connectionsData = await socialService.getConnections(currentUser.id);
        setConnections(connectionsData);
      }
    } catch (error) {
      console.error('Error rejecting connection request:', error);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setActiveTab('messages');
    // 加载与所选用户的消息
    if (currentUser) {
      loadMessages(currentUser.id, user.id);
    }
  };

  const loadMessages = async (userId: string, otherUserId: string) => {
    try {
      const messagesData = await socialService.getMessages(userId, otherUserId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || !selectedUser || !messageContent.trim()) return;

    try {
      await socialService.sendMessage(currentUser.id, selectedUser.id, messageContent);
      // 重新加载消息
      await loadMessages(currentUser.id, selectedUser.id);
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateCollaboration = async () => {
    if (!currentUser || !collaborationTitle.trim()) return;

    try {
      await socialService.createCollaboration(currentUser.id, collaborationTitle, collaborationDescription);
      // 重新加载协作数据
      const collaborationsData = await socialService.getCollaborations(currentUser.id);
      setCollaborations(collaborationsData);
      setShowCreateCollaboration(false);
      setCollaborationTitle('');
      setCollaborationDescription('');
    } catch (error) {
      console.error('Error creating collaboration:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingConnections = connections.filter(conn => conn.status === 'pending');
  const acceptedConnections = connections.filter(conn => conn.status === 'accepted');

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载社交数据中...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 社交概览卡片 */}
      <Card className="bg-card shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">社交概览</h3>
              <p className="text-sm text-muted-foreground">连接、消息和协作</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateCollaboration(true)}>
                <Plus size={16} className="mr-2" />
                创建协作
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Badge className="mb-2 bg-primary/10 text-primary">{acceptedConnections.length}</Badge>
              <p className="text-sm font-medium">已连接</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Badge className="mb-2 bg-yellow-100 text-yellow-800">{pendingConnections.length}</Badge>
              <p className="text-sm font-medium">待处理</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Badge className="mb-2 bg-green-100 text-green-800">{collaborations.length}</Badge>
              <p className="text-sm font-medium">协作项目</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 社交标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="connections">连接</TabsTrigger>
          <TabsTrigger value="messages">消息</TabsTrigger>
          <TabsTrigger value="collaborations">协作</TabsTrigger>
        </TabsList>

        {/* 连接标签页 */}
        <TabsContent value="connections" className="space-y-6">
          {/* 搜索用户 */}
          <Card>
            <CardHeader>
              <CardTitle>查找用户</CardTitle>
              <CardDescription>搜索并连接其他用户</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="搜索用户名或邮箱"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button>
                  <Search size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 用户列表 */}
          <Card>
            <CardHeader>
              <CardTitle>用户列表</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {filteredUsers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => {
                      const existingConnection = connections.find(
                        conn => (conn.userId === currentUser?.id && conn.connectedUserId === user.id) ||
                               (conn.userId === user.id && conn.connectedUserId === currentUser?.id)
                      );

                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
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
                          <div className="flex gap-2">
                            {existingConnection ? (
                              <Badge variant="secondary">
                                {existingConnection.status === 'pending' ? '待处理' : '已连接'}
                              </Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleSendConnectionRequest(user.id)}
                              >
                                <UserPlus size={14} className="mr-1" />
                                连接
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => handleSelectUser(user)}
                            >
                              <MessageSquare size={14} className="mr-1" />
                              消息
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">未找到用户</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 待处理连接 */}
          {pendingConnections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>待处理连接</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingConnections.map((connection) => {
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
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAcceptConnection(connection.id)}>
                            <Check size={14} />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleRejectConnection(connection.id)}>
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 消息标签页 */}
        <TabsContent value="messages" className="space-y-6">
          {selectedUser ? (
            <>
              {/* 消息头部 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedUser.name}</CardTitle>
                      <CardDescription>{selectedUser.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Separator />
                </CardContent>
              </Card>

              {/* 消息内容 */}
              <Card className="h-[600px]">
                <CardContent className="h-full p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {messages.length > 0 ? (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${message.senderId === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            >
                              <p>{message.content}</p>
                              <p className="text-xs mt-1 text-muted-foreground">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">暂无消息，开始聊天吧！</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <div className="flex gap-2 w-full">
                    <Textarea
                      placeholder="输入消息..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send size={16} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">选择一个用户开始聊天</h3>
                <p className="text-muted-foreground">从连接标签页中选择一个用户</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 协作标签页 */}
        <TabsContent value="collaborations" className="space-y-6">
          {/* 协作列表 */}
          <Card>
            <CardHeader>
              <CardTitle>协作项目</CardTitle>
            </CardHeader>
            <CardContent>
              {collaborations.length > 0 ? (
                <div className="space-y-4">
                  {collaborations.map((collaboration) => (
                    <div key={collaboration.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium mb-1">{collaboration.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{collaboration.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {collaboration.members.map((member, index) => (
                              <Badge key={index} variant="secondary">
                                {member.userId} ({member.role})
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Share2 size={14} className="mr-1" />
                            共享
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users2 size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">暂无协作项目</h3>
                  <p className="text-muted-foreground mb-4">创建一个协作项目开始团队合作</p>
                  <Button onClick={() => setShowCreateCollaboration(true)}>
                    <Plus size={16} className="mr-2" />
                    创建协作
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 创建协作对话框 */}
      <Dialog open={showCreateCollaboration} onOpenChange={setShowCreateCollaboration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建协作项目</DialogTitle>
            <DialogDescription>
              创建一个新的协作项目，邀请其他用户一起参与
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">项目标题</Label>
              <Input
                id="title"
                placeholder="输入项目标题"
                value={collaborationTitle}
                onChange={(e) => setCollaborationTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">项目描述</Label>
              <Textarea
                id="description"
                placeholder="输入项目描述"
                value={collaborationDescription}
                onChange={(e) => setCollaborationDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCreateCollaboration(false)}>
              取消
            </Button>
            <Button onClick={handleCreateCollaboration}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialDashboard;
