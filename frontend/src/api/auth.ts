import api from './api';

export const login = async (userId: string, password: string): Promise<void> => {
  const res = await api.post('/api/auth/login', { userId, password });
  localStorage.setItem('accessToken', res.data.accessToken);
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
  localStorage.removeItem('accessToken');
};

export const checkId = async (userId: string): Promise<boolean> => {
  const res = await api.get('/api/auth/check-id', { params: { userId } });
  return res.data.isDuplicate;
};

export const sendEmailCode = async (email: string): Promise<void> => {
  await api.post('/api/auth/email/send', { email });
};

export const verifyEmailCode = async (email: string, code: string): Promise<boolean> => {
  const res = await api.post('/api/auth/email/verify', { email, code });
  return res.data.isVerified;
};

export const signUp = async (data: {
  email: string;
  userId: string;
  password: string;
  nickname: string;
  name: string;
  phoneNumber: string;
}): Promise<void> => {
  await api.post('/api/auth/signup', data);
};

export const findId = async (email: string): Promise<string> => {
  const res = await api.post('/api/auth/find-id', { email });
  return res.data.userId;
};

export const findPassword = async (userId: string, email: string): Promise<string> => {
  const res = await api.post('/api/auth/find-password', { userId, email });
  return res.data.message;
};
