import { useCallback } from 'react';

export function useStorage(key, defaultValue) {
  const load = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const save = useCallback((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  return { load, save };
}
