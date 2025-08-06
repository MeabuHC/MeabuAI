import * as SecureStore from 'expo-secure-store';
import type { User } from '../types/auth';

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const secureStorage = {
    async setToken(token: string) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    },
    async getToken(): Promise<string | null> {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    },
    async setRefreshToken(refreshToken: string) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    },
    async getRefreshToken(): Promise<string | null> {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },
    async setUser(user: User) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    },
    async getUser(): Promise<User | null> {
        const userData = await SecureStore.getItemAsync(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },
    async clearAll() {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    },
}; 