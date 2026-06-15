import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        try {
            originalRequest._retry = true;
            const response = await api.post('/api/auth/reissue');

            localStorage.setItem('accessToken', response.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            return Promise.reject(refreshError);
        }
    }
);

export default api;
