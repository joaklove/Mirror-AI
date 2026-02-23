import { UserActivity, FeatureUsage } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
}

interface Collaboration {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  members: {
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
  }[];
}

interface SharedJournal {
  id: string;
  collaborationId: string;
  journalId: string;
  accessLevel: 'view' | 'edit';
  createdAt: Date;
}

// 模拟数据存储
class MockSocialStorage {
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

class SocialService {
  private storage = new MockSocialStorage();

  // 用户相关方法
  async getUsers(): Promise<User[]> {
    try {
      const usersData = await this.storage.getAll('users');
      return usersData.map(data => data as User);
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userData = await this.storage.get(`users/${userId}`);
      return userData as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userPath = `users/${userId}`;
      await this.storage.update(userPath, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  // 连接相关方法
  async sendConnectionRequest(userId: string, targetUserId: string): Promise<string> {
    try {
      const connectionId = `connection-${Date.now()}`;
      const connection: Connection = {
        id: connectionId,
        userId,
        connectedUserId: targetUserId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.storage.set(`connections/${connectionId}`, connection);
      return connectionId;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  }

  async acceptConnectionRequest(connectionId: string): Promise<void> {
    try {
      const connectionPath = `connections/${connectionId}`;
      await this.storage.update(connectionPath, {
        status: 'accepted',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  }

  async rejectConnectionRequest(connectionId: string): Promise<void> {
    try {
      const connectionPath = `connections/${connectionId}`;
      await this.storage.update(connectionPath, {
        status: 'rejected',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error rejecting connection request:', error);
    }
  }

  async getConnections(userId: string): Promise<Connection[]> {
    try {
      const connectionsData = await this.storage.getAll('connections');
      return connectionsData
        .filter(data => data.userId === userId || data.connectedUserId === userId)
        .map(data => data as Connection);
    } catch (error) {
      console.error('Error getting connections:', error);
      return [];
    }
  }

  // 消息相关方法
  async sendMessage(senderId: string, receiverId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<string> {
    try {
      const messageId = `message-${Date.now()}`;
      const message: Message = {
        id: messageId,
        senderId,
        receiverId,
        content,
        type,
        status: 'sent',
        createdAt: new Date()
      };

      await this.storage.set(`messages/${messageId}`, message);
      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getMessages(userId: string, otherUserId: string): Promise<Message[]> {
    try {
      const messagesData = await this.storage.getAll('messages');
      return messagesData
        .filter(data => 
          (data.senderId === userId && data.receiverId === otherUserId) ||
          (data.senderId === otherUserId && data.receiverId === userId)
        )
        .map(data => data as Message)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const messagePath = `messages/${messageId}`;
      await this.storage.update(messagePath, { status: 'read' });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  // 协作相关方法
  async createCollaboration(userId: string, title: string, description: string): Promise<string> {
    try {
      const collaborationId = `collaboration-${Date.now()}`;
      const collaboration: Collaboration = {
        id: collaborationId,
        title,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            userId,
            role: 'owner'
          }
        ]
      };

      await this.storage.set(`collaborations/${collaborationId}`, collaboration);
      return collaborationId;
    } catch (error) {
      console.error('Error creating collaboration:', error);
      throw error;
    }
  }

  async addCollaborationMember(collaborationId: string, userId: string, role: 'editor' | 'viewer'): Promise<void> {
    try {
      const collaborationPath = `collaborations/${collaborationId}`;
      const collaboration = await this.storage.get(collaborationPath);
      
      if (collaboration) {
        collaboration.members.push({ userId, role });
        collaboration.updatedAt = new Date();
        await this.storage.update(collaborationPath, collaboration);
      }
    } catch (error) {
      console.error('Error adding collaboration member:', error);
    }
  }

  async removeCollaborationMember(collaborationId: string, userId: string): Promise<void> {
    try {
      const collaborationPath = `collaborations/${collaborationId}`;
      const collaboration = await this.storage.get(collaborationPath);
      
      if (collaboration) {
        collaboration.members = collaboration.members.filter(member => member.userId !== userId);
        collaboration.updatedAt = new Date();
        await this.storage.update(collaborationPath, collaboration);
      }
    } catch (error) {
      console.error('Error removing collaboration member:', error);
    }
  }

  async getCollaborations(userId: string): Promise<Collaboration[]> {
    try {
      const collaborationsData = await this.storage.getAll('collaborations');
      return collaborationsData
        .filter(data => data.members.some(member => member.userId === userId))
        .map(data => data as Collaboration);
    } catch (error) {
      console.error('Error getting collaborations:', error);
      return [];
    }
  }

  // 共享日记相关方法
  async shareJournal(collaborationId: string, journalId: string, accessLevel: 'view' | 'edit'): Promise<string> {
    try {
      const sharedJournalId = `shared-journal-${Date.now()}`;
      const sharedJournal: SharedJournal = {
        id: sharedJournalId,
        collaborationId,
        journalId,
        accessLevel,
        createdAt: new Date()
      };

      await this.storage.set(`sharedJournals/${sharedJournalId}`, sharedJournal);
      return sharedJournalId;
    } catch (error) {
      console.error('Error sharing journal:', error);
      throw error;
    }
  }

  async getSharedJournals(collaborationId: string): Promise<SharedJournal[]> {
    try {
      const sharedJournalsData = await this.storage.getAll('sharedJournals');
      return sharedJournalsData
        .filter(data => data.collaborationId === collaborationId)
        .map(data => data as SharedJournal);
    } catch (error) {
      console.error('Error getting shared journals:', error);
      return [];
    }
  }
}

export const socialService = new SocialService();
export type { User, Connection, Message, Collaboration, SharedJournal };
