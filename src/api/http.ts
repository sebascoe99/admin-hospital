import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

let refreshPromise: Promise<void> | null = null;

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && !config.headers._skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
    const sid = localStorage.getItem('sessionId');
    if (sid) config.headers['x-session-id'] = sid;
  }
  delete config.headers._skipAuth;
  return config;
});

async function doRefresh(): Promise<void> {
  const rt = localStorage.getItem('refreshToken');
  const sid = localStorage.getItem('sessionId');
  if (!rt || !sid) throw new Error('No tokens');

  const res = await http.post(
    '/auth/refresh',
    { refreshToken: rt, sessionId: sid },
    { headers: { _skipAuth: 'true' } },
  );
  const { accessToken, refreshToken, sessionId } = res.data.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('sessionId', String(sessionId));
}

function forceLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sessionId');
  window.location.href = '/login';
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || original?._retry || original?.headers?._skipAuth) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
      }
      await refreshPromise;
      original.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
      return http.request(original);
    } catch {
      forceLogout();
      return Promise.reject(error);
    }
  },
);
