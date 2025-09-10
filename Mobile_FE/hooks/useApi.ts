import { useCallback, useState } from 'react';

interface UseApiReturn<T, TParams extends any[] = []> {
  data: T | null;
  setData: (data: T | ((prev: T | null) => T)) => void;
  isLoading: boolean;
  error: string | null;
  execute: (...params: TParams) => Promise<void>;
  reset: () => void;
}

export const useApi = <T, TParams extends any[] = []>(
  apiCall: (...params: TParams) => Promise<T>
): UseApiReturn<T, TParams> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...params: TParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiCall(...params);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const setDataWrapper = useCallback((value: T | ((prev: T | null) => T)) => {
    if (typeof value === 'function') {
      setData((prev) => (value as (prev: T | null) => T)(prev));
    } else {
      setData(value);
    }
  }, []);

  return { data, setData: setDataWrapper, isLoading, error, execute, reset };
};
