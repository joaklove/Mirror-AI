import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 创建模拟用户数据的函数
  // 使用固定的 user_id，确保数据持久化
  const createMockUser = (email: string): User => ({
    id: 'mock-user-id',  // 保持固定 user_id，这样数据才能持久化
    email,
    phone: null,
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: null,
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { full_name: 'Mock User', avatar_url: null },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // 立即返回模拟用户，不使用异步操作
  const [user, setUser] = useState<User | null>(createMockUser('user@example.com'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 直接设置为已加载状态
    setLoading(false);

    // 在实际应用中，这里会使用真实的 Supabase 认证
    /*
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
    */
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // 登录成功后设置用户状态，使用用户输入的邮箱
    setUser(createMockUser(email));
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    // 注册成功后自动登录，设置用户状态，使用用户输入的邮箱
    setUser(createMockUser(email));
  };

  const signOut = async () => {
    // 清除本地用户状态
    setUser(null);
    // 调用 Supabase 登出（如果使用真实认证）
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
