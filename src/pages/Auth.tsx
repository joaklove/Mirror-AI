import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { AuthEvents } from '@/utils/analytics';
import { PostHogAuthEvents } from '@/utils/posthog';

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
        // GA 追踪：用户登录
        AuthEvents.signIn('email');
        // PostHog 追踪：用户登录
        PostHogAuthEvents.signIn('email');
      } else {
        await signUp(email, password);
        // GA 追踪：用户注册
        AuthEvents.signUp('email');
        // PostHog 追踪：用户注册
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
      {/* Background with ambient light */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-20%] w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(244,63,94,0.4)_0%,_transparent_70%)] blur-[120px] animate-float" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[900px] h-[900px] bg-[radial-gradient(circle,_rgba(217,119,6,0.35)_0%,_transparent_70%)] blur-[140px] animate-float" style={{ animationDelay: '0s', animationDirection: 'reverse' }} />
      </div>

      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-rose-500/20 shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-rose-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              Mirror AI
            </h1>
          </div>
          <p className="text-gray-400 text-sm">记录当下，照见内心</p>
        </div>

        {/* Tab Switch */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 rounded-lg">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              isLogin
                ? 'bg-gradient-to-r from-rose-500 to-orange-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !isLogin
                ? 'bg-gradient-to-r from-rose-500 to-orange-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            注册
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              邮箱
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="bg-slate-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              密码
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-slate-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">密码至少 6 位</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white h-11"
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
        <div className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-rose-400 hover:text-rose-300 ml-1 font-medium"
          >
            {isLogin ? '立即注册' : '去登录'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
