import { secureStorage } from '../utils/storage';

interface StreamingOptions {
    onMessage: (chunk: string) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
    onHeaders?: (headers: Headers) => void; // expose response headers (e.g., X-Thread-Id)
    signal?: AbortSignal;
}

export class StreamingApiService {
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.EXPO_PUBLIC_API_URL || '';
    }

    // Helper method to combine multiple AbortSignals
    private combineAbortSignals(signals: AbortSignal[]): AbortSignal {
        const controller = new AbortController();

        signals.forEach(signal => {
            if (signal.aborted) {
                controller.abort();
            } else {
                signal.addEventListener('abort', () => controller.abort());
            }
        });

        return controller.signal;
    }

    async streamMessage(
        message: string,
        threadId: string,
        options: StreamingOptions,
        updatedAt?: string
    ): Promise<void> {
        try {
            // Create timeout controller for 5-second timeout
            const timeoutController = new AbortController();
            const timeoutId = setTimeout(() => {
                timeoutController.abort();
            }, 5000);

            // Combine user signal with timeout signal
            const combinedSignal = options.signal ?
                this.combineAbortSignals([options.signal, timeoutController.signal]) :
                timeoutController.signal;

            // Helper: perform the streaming fetch with a given token
            const doStreamFetch = async (accessToken: string) => {
                return await fetch(`${this.baseURL}/ai/stream`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'text/event-stream',
                    },
                    body: JSON.stringify({
                        threadId,
                        message,
                        updatedAt: updatedAt || new Date().toISOString(),
                    }),
                    // Enable streaming for React Native
                    reactNative: { textStreaming: true },
                    signal: combinedSignal,
                } as any);
            };

            // Helper: try to refresh tokens
            const tryRefreshToken = async (): Promise<string | null> => {
                const refreshToken = await secureStorage.getRefreshToken();
                if (!refreshToken) return null;
                try {
                    // Create timeout for refresh token call
                    const refreshTimeoutController = new AbortController();
                    const refreshTimeoutId = setTimeout(() => {
                        refreshTimeoutController.abort();
                    }, 5000);

                    const resp = await fetch(`${this.baseURL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: refreshToken }),
                        signal: refreshTimeoutController.signal,
                    });

                    clearTimeout(refreshTimeoutId);

                    if (!resp.ok) return null;
                    const data = await resp.json();
                    const newAccess: string | undefined = data?.access_token;
                    const newRefresh: string | undefined = data?.refresh_token;
                    if (newAccess) {
                        await secureStorage.setToken(newAccess);
                        if (newRefresh) {
                            await secureStorage.setRefreshToken(newRefresh);
                        }
                        return newAccess;
                    }
                    return null;
                } catch {
                    return null;
                }
            };

            // 1) First attempt with current token
            let token = await secureStorage.getToken();
            if (!token) throw new Error('No authentication token found');

            let response = await doStreamFetch(token);

            // 2) If unauthorized, refresh once and retry
            if (response.status === 401) {
                const refreshed = await tryRefreshToken();
                if (!refreshed) {
                    throw new Error('Unauthorized (token expired) and refresh failed');
                }
                token = refreshed;
                response = await doStreamFetch(token);
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (options.onHeaders) {
                try {
                    options.onHeaders(response.headers);
                } catch { }
            }

            if (!response.body) {
                throw new Error('No response body received');
            }

            // Get the reader from the response body
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        clearTimeout(timeoutId);
                        options.onComplete();
                        break;
                    }

                    if (value) {
                        const chunk = decoder.decode(value, { stream: true });

                        // Split by lines in case multiple events come in one chunk
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.trim()) {
                                // Handle Server-Sent Events format
                                if (line.startsWith('data: ')) {
                                    const data = line.slice(6).trim();
                                    if (data === '[DONE]') {
                                        clearTimeout(timeoutId);
                                        options.onComplete();
                                        return;
                                    }

                                    try {
                                        // Try to parse as JSON
                                        const parsed = JSON.parse(data);
                                        if (parsed.content) {
                                            options.onMessage(parsed.content);
                                        } else {
                                            // If it's just text content
                                            options.onMessage(data);
                                        }
                                    } catch {
                                        // If not JSON, treat as plain text
                                        options.onMessage(data);
                                    }
                                } else if (line.trim() && !line.startsWith('event:') && !line.startsWith('id:')) {
                                    // Handle plain text streaming
                                    options.onMessage(line.trim());
                                }
                            }
                        }
                    }
                }
            } finally {
                clearTimeout(timeoutId);
                reader.releaseLock();
            }
        } catch (error) {
            if (error instanceof Error) {
                // Provide better error message for timeout/abort errors
                if (error.name === 'AbortError' || error.message.includes('aborted')) {
                    options.onError(new Error('Request timed out. Please check your connection and try again.'));
                } else {
                    options.onError(error);
                }
            } else {
                options.onError(new Error('Unknown streaming error'));
            }
        }
    }
}

export const streamingApi = new StreamingApiService();
