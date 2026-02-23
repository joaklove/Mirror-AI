import { useRef, useCallback } from 'react';

/**
 * 节流钩子，用于限制函数调用频率
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流处理后的函数
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCallTime = useRef<number>(0);
  const isThrottled = useRef<boolean>(false);
  const pendingArgs = useRef<Parameters<T> | null>(null);

  const throttledFunction = useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime.current >= delay && !isThrottled.current) {
      lastCallTime.current = now;
      isThrottled.current = true;

      func(...args);

      setTimeout(() => {
        isThrottled.current = false;
        if (pendingArgs.current) {
          const argsToCall = pendingArgs.current;
          pendingArgs.current = null;
          throttledFunction(...argsToCall);
        }
      }, delay);
    } else if (!isThrottled.current) {
      // 如果函数没有被节流，存储参数以便延迟后调用
      pendingArgs.current = args;
    }
  }, [func, delay]);

  return throttledFunction;
}

/**
 * 防抖钩子，用于在用户停止操作后执行函数
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖处理后的函数
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);
}