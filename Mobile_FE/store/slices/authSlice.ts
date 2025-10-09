import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { secureStorage } from '../../utils/storage';

import type {
    AuthResponse,
    AuthState,
    LoginCredentials,
    RegisterCredentials,
    User
} from '../../types/auth';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async thunks for API calls
export const restoreAuthState = createAsyncThunk(
    'auth/restoreAuthState',
    async (_, { rejectWithValue }) => {
        try {
            const [token, refreshToken, userData] = await Promise.all([
                secureStorage.getToken(),
                secureStorage.getRefreshToken(),
                secureStorage.getUser(),
            ]);

            if (!token || !userData) {
                return rejectWithValue('No stored authentication data');
            }

            return {
                user: userData,
                token,
                refreshToken,
            };
        } catch (error) {
            return rejectWithValue('Failed to restore authentication state');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            // Artificial delay to showcase loading screen
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const response = await api.post('/auth/login', credentials);
            const authData = response.data as AuthResponse;

            // Store tokens immediately after successful login
            await secureStorage.setToken(authData.access_token);
            if (authData.refresh_token) {
                await secureStorage.setRefreshToken(authData.refresh_token);
            }
            await secureStorage.setUser(authData.user);

            return authData;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            return rejectWithValue(message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            // Artificial delay to showcase loading screen
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const response = await api.post('/auth/register', credentials);
            const authData = response.data as AuthResponse;

            // Store tokens immediately after successful registration
            await secureStorage.setToken(authData.access_token);
            if (authData.refresh_token) {
                await secureStorage.setRefreshToken(authData.refresh_token);
            }
            await secureStorage.setUser(authData.user);

            return authData;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Registration failed';
            return rejectWithValue(message);
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = await secureStorage.getRefreshToken();

            if (!refreshToken) {
                return rejectWithValue('No refresh token available');
            }

            const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
            const tokenData = response.data as { access_token: string; refresh_token?: string };

            // Store new tokens immediately after successful refresh
            await secureStorage.setToken(tokenData.access_token);
            if (tokenData.refresh_token) {
                await secureStorage.setRefreshToken(tokenData.refresh_token);
            }

            return tokenData;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Token refresh failed';
            return rejectWithValue(message);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            // Clear secure storage
            secureStorage.clearAll();
        },
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action: PayloadAction<AuthResponse>) => {
            const { user, access_token, refresh_token } = action.payload;
            state.user = user;
            state.isAuthenticated = true;
            state.error = null;
            // Store tokens securely
            secureStorage.setToken(access_token);
            if (refresh_token) {
                secureStorage.setRefreshToken(refresh_token);
            }
            secureStorage.setUser(user);
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Restore auth state cases
            .addCase(restoreAuthState.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(restoreAuthState.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(restoreAuthState.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                // Tokens are now stored in the thunk
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })
            // Register cases
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                // Tokens are now stored in the thunk
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })
            // Refresh token cases
            .addCase(refreshToken.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                // Tokens are now stored in the thunk
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                // If refresh fails, logout the user
                state.user = null;
                state.isAuthenticated = false;
                // Clear secure storage
                secureStorage.clearAll();
            });
    },
});

export const { logout, clearError, setCredentials, updateUser } = authSlice.actions;

export default authSlice.reducer; 