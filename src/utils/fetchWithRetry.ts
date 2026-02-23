interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
}

export const fetchWithRetry = async (
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> => {
  const {
    retries = 3,
    retryDelay = 1000,
    maxRetryDelay = 10000,
    ...fetchOptions
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // 如果请求成功，直接返回响应
      if (response.ok) {
        return response;
      }

      // 如果是4xx错误（客户端错误），不重试
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} ${response.statusText}`);
      }

      // 如果是5xx错误（服务器错误），继续重试
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;

      // 如果是最后一次尝试，抛出错误
      if (attempt === retries) {
        throw lastError;
      }

      // 计算指数退避延迟
      const delay = Math.min(
        retryDelay * Math.pow(2, attempt) + Math.random() * 100,
        maxRetryDelay
      );

      console.warn(`Request failed (attempt ${attempt + 1}/${retries}), retrying in ${Math.round(delay)}ms:`, lastError.message);

      // 等待延迟后重试
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // 理论上不会到达这里，但为了类型安全，添加返回值
  throw lastError;
};

// 专门用于AI API请求的函数
export const fetchAI = async (
  endpoint: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> => {
  const apiBaseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api';
  const url = `${apiBaseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  return fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};