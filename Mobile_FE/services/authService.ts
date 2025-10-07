import { secureStorage } from '../utils/storage';

export class AuthService {
    static async clearAuthData(): Promise<void> {
        await secureStorage.clearAll();
    }

    static async getToken(): Promise<string | null> {
        return await secureStorage.getToken();
    }

    static async getRefreshToken(): Promise<string | null> {
        return await secureStorage.getRefreshToken();
    }

    static async setToken(token: string): Promise<void> {
        await secureStorage.setToken(token);
    }

    static async setRefreshToken(refreshToken: string): Promise<void> {
        await secureStorage.setRefreshToken(refreshToken);
    }
}
