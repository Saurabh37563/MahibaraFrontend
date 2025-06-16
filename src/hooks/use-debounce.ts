import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

// Generic version for debounced callback
export function useDebouncedCallback<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
  delay: number = 500
): (...args: Args) => Promise<Return> {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return (...args: Args) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise<Return>((resolve) => {
      timeoutRef.current = setTimeout(() => {
        resolve(callbackRef.current(...args));
      }, delay);
    });
  };
}
