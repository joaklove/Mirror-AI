import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

export interface VirtualListOptions<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  containerHeight: number;
}

export interface VirtualItem {
  index: number;
  start: number;
}

export interface VirtualListResult<T> {
  virtualItems: VirtualItem[];
  totalHeight: number;
  measureRef: (index: number) => (element: HTMLElement | null) => void;
  scrollToIndex: (index: number) => void;
}

export function useVirtualList<T>({
  items,
  itemHeight,
  overscan = 3,
  containerHeight,
}: VirtualListOptions<T>): VirtualListResult<T> {
  const scrollTop = useRef(0);
  const measuredHeights = useRef(new Map<number, number>());

  const getItemHeight = useCallback(
    (index: number) => {
      return measuredHeights.current.get(index) || itemHeight;
    },
    [itemHeight]
  );

  const virtualItems = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop.current / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop.current + containerHeight) / itemHeight) + overscan
    );

    const result: VirtualItem[] = [];
    let currentStart = startIndex * itemHeight;

    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        start: currentStart,
      });
      currentStart += getItemHeight(i);
    }

    return result;
  }, [items.length, itemHeight, containerHeight, overscan, getItemHeight]);

  const totalHeight = useMemo(() => {
    return items.reduce((sum, _, index) => sum + getItemHeight(index), 0);
  }, [items, getItemHeight]);

  const measureRef = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      if (element) {
        const height = element.getBoundingClientRect().height;
        if (height !== measuredHeights.current.get(index)) {
          measuredHeights.current.set(index, height);
        }
      }
    },
    []
  );

  const scrollToIndex = useCallback((index: number) => {
    const element = document.getElementById(`virtual-item-${index}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return {
    virtualItems,
    totalHeight,
    measureRef,
    scrollToIndex,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, options]);

  return ref as React.RefObject<HTMLDivElement | null>;
}
