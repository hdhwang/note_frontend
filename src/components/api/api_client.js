import axios from 'axios';
import { useNavigate} from "react-router-dom";

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
apiClient.interceptors.request.use((config) => {
    // 로컬 스토리지에서 토큰 조회
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 응답 인터셉터
apiClient.interceptors.response.use((response) => response,
    async (error) => {
        const navigate = useNavigate();
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // 로컬 스토에서 리프레시 토큰 조회
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
                    const url = `${process.env.REACT_APP_API_URL}/token/refresh`;
                    const response = await axios.post(url, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);

                    // 실패한 요청을 새 액세스 토큰으로 재시도
                    apiClient.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    return apiClient(originalRequest);
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');

                    console.error('Refresh token is expired or invalid:', error);
                    navigate('/login');
                }
            } else {
                console.error('Refresh token not found.');
                navigate('/login');
            }
            return Promise.reject(error);
        }
    }
);

export default apiClient;
