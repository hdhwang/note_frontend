import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

// 1. Vite 환경 변수 타입 안전성 확보 (import.meta as any 사용으로 간소화)
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: `${VITE_API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Custom navigation function
const navigateToLogin = (): void => {
    window.location.href = '/login';
};

// 응답 인터셉터
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // error.response가 존재하고 status가 401인 경우 처리
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
                    const url = `${VITE_API_URL}/token/refresh`;
                    const response = await axios.post<{ access: string }>(url, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);

                    // 기본 헤더 및 실패했던 이전 요청의 헤더 갱신
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }

                    // 실패한 요청 재시도
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    console.error('Refresh token is expired or invalid:', refreshError);
                    navigateToLogin();
                    return Promise.reject(refreshError);
                }
            } else {
                console.error('Refresh token not found.');
                navigateToLogin();
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;