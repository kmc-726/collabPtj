import axios from 'axios';
import api from './axiosInstance';
import { setAccessToken, clearAccessToken, getAccessToken } from './authToken';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// 앱 시작 시 refreshToken 쿠키로 accessToken 재발급
export const initAuth = async (): Promise<boolean> => {
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/reissue`,
      {},
      { withCredentials: true }
    );
    setAccessToken(res.data.accessToken);
    return true;
  } catch {
    // 쿠키 없거나 만료된 경우 — 정상 케이스, 에러 로그 없이 처리
    return false;
  }
};

export const login = async (userId: string, password: string): Promise<void> => {
  const res = await axios.post(
    `${BASE_URL}/auth/login`,
    { userId, password },
    { withCredentials: true }
  );
  setAccessToken(res.data.accessToken);
};

export const logout = async (): Promise<void> => {
  try {
    // 토큰이 있을 때만 로그아웃 API 호출
    if (getAccessToken()) {
      await api.post('/auth/logout');
    }
  } catch {
    // 실패해도 클라이언트 토큰은 반드시 제거
  } finally {
    clearAccessToken();
  }
};

export const checkId = async (userId: string): Promise<boolean> =>
  api.get('/auth/check-id', { params: { userId } }).then((r) => r.data.isDuplicate);

export const sendEmailCode = async (email: string): Promise<void> => {
  await api.post('/auth/email/send', { email });
};

export const verifyEmailCode = async (email: string, code: string): Promise<boolean> =>
  api.post('/auth/email/verify', { email, code }).then((r) => r.data.isVerified);

export const signUp = async (data: {
  email: string;
  userId: string;
  password: string;
  nickname: string;
  name: string;
  phoneNumber: string;
}): Promise<void> => {
  await api.post('/auth/signup', data);
};

export const findId = async (email: string): Promise<string> =>
  api.post('/auth/find-id', { email }).then((r) => r.data.userId);

export const findPassword = async (userId: string, email: string): Promise<string> =>
  api.post('/auth/find-password', { userId, email }).then((r) => r.data.message);