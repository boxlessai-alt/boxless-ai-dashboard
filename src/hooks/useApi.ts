import { useCallback } from 'react';

const API_BASE = '/api';

export function useApi() {
  const getToken = useCallback(() => {
    return localStorage.getItem('dashboard_token');
  }, []);

  const fetcher = useCallback(
    async <T>(endpoint: string): Promise<T> => {
      const token = getToken();
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('dashboard_token');
          localStorage.removeItem('dashboard_user');
          window.location.hash = '#/login';
        }
        const text = await response.text();
        // Check if response is HTML instead of JSON
        if (text.trim().startsWith('<')) {
          throw new Error('Backend server is not running. Please deploy to Render or start the server locally.');
        }
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { message: `HTTP ${response.status}: ${text.slice(0, 200)}` };
        }
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      const text = await response.text();

      // Check if response is HTML instead of JSON (backend unavailable)
      if (text.trim().startsWith('<') || !contentType?.includes('application/json')) {
        throw new Error('Backend server is not running. Please deploy to Render or start the server locally.');
      }

      return JSON.parse(text) as T;
    },
    [getToken]
  );

  const post = useCallback(
    async <T>(endpoint: string, body?: Record<string, unknown>): Promise<T> => {
      const token = getToken();
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('dashboard_token');
          localStorage.removeItem('dashboard_user');
          window.location.hash = '#/login';
        }
        const text = await response.text();
        // Check if response is HTML instead of JSON
        if (text.trim().startsWith('<')) {
          throw new Error('Backend server is not running. Please deploy to Render or start the server locally.');
        }
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { message: `HTTP ${response.status}: ${text.slice(0, 200)}` };
        }
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      const text = await response.text();

      // Check if response is HTML instead of JSON (backend unavailable)
      if (text.trim().startsWith('<') || !contentType?.includes('application/json')) {
        throw new Error('Backend server is not running. Please deploy to Render or start the server locally.');
      }

      return JSON.parse(text) as T;
    },
    [getToken]
  );

  return { fetcher, post, getToken };
}
