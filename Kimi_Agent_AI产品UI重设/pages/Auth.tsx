import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AuthEvents } from '@/utils/analytics';
import { PostHogAuthEvents } from '@/utils/posthog';
import { TaijiIcon } from '@/components/TaijiIcon';
import { InkBackground } from '@/components/InkBackground';
import { cn } from '@/lib/utils';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 水墨背景 */}
      <InkBackground intensity="light" />
      
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10">
        {/* 左上角朱砂光晕 */}
        <div 
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsla(9, 52%, 53%, 0.08) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        {/* 右下角青绿光晕 */}
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] rounded-full animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsla(168, 16%, 42%, 0.06) 0%, transparent 60%)',
            filter: 'blur(100px)',
            animationDelay: '-2s',
          }}
        />
      </div>

      {/* 主卡片 */}
      <Card className="w-full max-w-md dao-glass shadow-elevated p-8 md:p-10 relative animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <TaijiIcon size={44} animated={false} />
          </div>
          <h1 
            className="text-3xl font-semibold mb-2"
            style={{ 
              fontFamily: 'var(--font-serif)',
              color: 'hsl(var(--ink-green))',
              letterSpacing: '0.05em',
            }}
          >
            心镜 AI
          </h1>
          <p 
            className="text-sm"
            style={{ 
              color: 'hsl(var(--mountain-green))',
              fontFamily: 'var(--font-sans)',
            }}
          >
            照见内心 · 道法自然
          </p>
        </div>

        {/* Tab Switch */}
        <div 
          className="flex gap-1 mb-8 p-1 rounded-xl"
          style={{ 
            background: 'hsl(var(--paper-yellow))',
            border: '1px solid hsl(var(--light-ink))',
          }}
        >
          <button
            onClick={() => setIsLogin(true)}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300',
              isLogin
                ? 'text-white shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            )}
            style={{
              background: isLogin 
                ? 'linear-gradient(135deg, hsl(9, 52%, 53%) 0%, hsl(9, 52%, 58%) 100%)' 
                : 'transparent',
            }}
          >
            登录
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300',
              !isLogin
                ? 'text-white shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            )}
            style={{
              background: !isLogin 
                ? 'linear-gradient(135deg, hsl(9, 52%, 53%) 0%, hsl(9, 52%, 58%) 100%)' 
                : 'transparent',
            }}
          >
            注册
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
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
              className="dao-input w-full"
            />
          </div>

          <div>
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
              className="dao-input w-full"
            />
            {!isLogin && (
              <p 
                className="text-xs mt-1.5"
                style={{ color: 'hsl(var(--smoke-gray))' }}
              >
                密码至少 6 位
              </p>
            )}
          </div>

          {error && (
            <div 
              className="rounded-lg p-3 text-sm"
              style={{ 
                background: 'hsla(9, 52%, 53%, 0.08)',
                border: '1px solid hsla(9, 52%, 53%, 0.2)',
                color: 'hsl(var(--cinnabar))',
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary h-12 text-base"
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

        {/* Footer */}
        <div 
          className="mt-8 text-center text-sm"
          style={{ color: 'hsl(var(--smoke-gray))' }}
        >
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="ml-1 font-medium transition-colors hover:underline"
            style={{ color: 'hsl(var(--cinnabar))' }}
          >
            {isLogin ? '立即注册' : '去登录'}
          </button>
        </div>

        {/* 装饰分隔线 */}
        <div className="dao-divider mt-8" />
        
        {/* 道家格言 */}
        <p 
          className="text-center text-xs italic"
          style={{ color: 'hsl(var(--smoke-gray))' }}
        >
          「知人者智，自知者明」
        </p>
      </Card>
    </div>
  );
};

export default Auth;
