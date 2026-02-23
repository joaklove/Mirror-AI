import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { AuthEvents } from '@/utils/analytics';
import { PostHogAuthEvents } from '@/utils/posthog';
import { InkBackground } from '@/components/InkBackground';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return '密码至少需要6个字符';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        AuthEvents.signIn('email');
        PostHogAuthEvents.signIn('email');
      } else {
        await signUp(email, password);
        AuthEvents.signUp('email');
        PostHogAuthEvents.signUp('email');
      }
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败，请重试';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <InkBackground intensity="light" />
      
      <Card className="dao-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8" style={{ color: 'hsl(var(--cinnabar))' }} />
            <h1 
              className="text-3xl font-bold"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
              }}
            >
              心镜 AI
            </h1>
          </div>
          <p 
            className="text-sm"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            照见内心 · 道法自然
          </p>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-lg animate-fade-in-up" style={{ background: 'hsl(var(--paper-yellow))' }}>
          <button
            onClick={() => setIsLogin(true)}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all"
            style={{
              background: isLogin ? 'hsl(var(--cinnabar))' : 'transparent',
              color: isLogin ? 'white' : 'hsl(var(--mountain-green))',
            }}
          >
            登录
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all"
            style={{
              background: !isLogin ? 'hsl(var(--cinnabar))' : 'transparent',
              color: !isLogin ? 'white' : 'hsl(var(--mountain-green))',
            }}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <label 
              className="text-sm font-medium mb-2 block"
              style={{ color: 'hsl(var(--ink-green))' }}
            >
              邮箱
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="dao-input"
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <label 
              className="text-sm font-medium mb-2 block"
              style={{ color: 'hsl(var(--ink-green))' }}
            >
              密码
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="dao-input"
            />
            {!isLogin && (
              <p 
                className="text-xs mt-1"
                style={{ color: 'hsl(var(--smoke-gray))' }}
              >
                密码至少 6 位
              </p>
            )}
          </div>

          {error && (
            <div 
              className="rounded-lg p-3 text-sm animate-fade-in-up"
              style={{ 
                background: 'hsla(350,60%,50%,0.1)',
                border: '1px solid hsla(350,60%,50%,0.3)',
                color: 'hsl(350,60%,50%)',
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-11 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLogin ? '登录中...' : '注册中...'}
              </>
            ) : (
              <>{isLogin ? '登录' : '注册'}</>
            )}
          </Button>
        </form>

        <div 
          className="mt-6 text-center text-sm animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <span style={{ color: 'hsl(var(--smoke-gray))' }}>
            {isLogin ? '还没有账号？' : '已有账号？'}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="ml-1 font-medium transition-colors"
            style={{ color: 'hsl(var(--cinnabar))' }}
          >
            {isLogin ? '立即注册' : '去登录'}
          </button>
        </div>

        <div 
          className="mt-8 text-center animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          <p 
            className="text-sm italic"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            「知人者智，自知者明」
          </p>
          <p 
            className="text-xs mt-1"
            style={{ color: 'hsl(var(--smoke-gray))', opacity: 0.7 }}
          >
            ——《道德经》
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
