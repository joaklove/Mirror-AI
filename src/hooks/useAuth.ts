import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>({
    id: 'mock-user-id',
    email: 'user@example.com',
    displayName: 'Mock User',
    photoURL: null
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 模拟认证状态检查
  useEffect(() => {
    // 在实际应用中，这里会检查真实的认证状态
    setLoading(true);
    
    // 模拟异步操作
    setTimeout(() => {
      // 模拟用户已登录
      setUser({
        id: 'mock-user-id',
        email: 'user@example.com',
        displayName: 'Mock User',
        photoURL: null
      });
      setLoading(false);
    }, 500);
  }, []);

  return { user, loading, error };
}
