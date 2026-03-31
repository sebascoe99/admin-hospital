import { http } from './http';

export async function login(email: string, password: string) {
  const res = await http.post('/auth/login', { email, password }, { headers: { _skipAuth: 'true' } });
  const { accessToken, refreshToken, sessionId } = res.data.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('sessionId', String(sessionId));
  return res.data;
}

export async function getMe() {
  const res = await http.get('/auth/me');
  return res.data.data;
}

export async function logout() {
  try {
    await http.post('/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}
