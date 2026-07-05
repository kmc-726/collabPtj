import axios, { type AxiosInstance } from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './authToken';

// 로컬 개발: http://localhost:8080/api
// Docker / 배포: /api (Nginx가 백엔드로 프록시)
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// 공통 axios 인스턴스
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // refreshToken 쿠키 자동 전송
});

// 요청 시 메모리의 accessToken 헤더에 주입
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

// 응답 401 시 자동으로 토큰 재발급 후 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // 이미 재발급 중이면 큐에 대기
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/reissue`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.accessToken;
        setAccessToken(newToken);

        // 대기 중인 요청 전부 재시도
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // 재발급 실패 → 로그인으로
        clearAccessToken();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
