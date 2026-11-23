import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 真实 Supabase 认证：未登录时 user 为 null，由 ProtectedRoute 跳登录页。
  // 页面显示的身份与写库校验的身份（auth.getUser）必须是同一个，否则会出现
  // "页面看似已登录、写库却被 RLS 拒绝"的矛盾。
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    // 读取已有会话（刷新后保持登录）
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听登录/登出/令牌刷新
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // 用 Supabase 返回的真实用户（含真实 id），onAuthStateChange 也会同步
    setUser(data.user);
  };

  const signUp = async (email: string, password: string): Promise<{ needsConfirmation: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    // 若项目开启了邮箱确认，注册后没有 session，此时 data.user 存在但无法写库。
    // 交由调用方按 session 是否存在给出提示，不在这里伪造登录态。
    const needsConfirmation = !data.session;
    setUser(data.session?.user ?? null);
    return { needsConfirmation };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
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
