import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from './authService';

// Extend the AxiosRequestConfig interface to include our custom properties
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _tokenLogged?: boolean;
    _retry?: boolean;
}

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config: CustomAxiosRequestConfig) => {
        const token = await AuthService.getToken();

        // Only log if we haven't logged for this request
        if (!config._tokenLogged) {
            console.log('🔑 Token being sent for:', config.url, token ? `${token.substring(0, 20)}...` : 'No token');
            config._tokenLogged = true;
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AuthService.getRefreshToken();

                if (!refreshToken) {
                    // No refresh token available, clear storage and surface error
                    await AuthService.clearAuthData();
                    return Promise.reject(error);
                }

                // Call refresh endpoint
                const refreshResponse = await axios.post(
                    `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;

                // Store new tokens
                await AuthService.setToken(access_token);
                if (newRefreshToken) {
                    await AuthService.setRefreshToken(newRefreshToken);
                }

                // Update the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear storage and surface error
                await AuthService.clearAuthData();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api; 