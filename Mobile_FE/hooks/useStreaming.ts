import { useCallback, useRef, useState } from 'react';
import { streamingApi } from '../services/streamingApi';

interface UseStreamingReturn {
    isStreaming: boolean;
    error: string | null;
    streamMessage: (
        message: string,
        threadId: string,
        onChunk: (chunk: string) => void,
        onComplete?: () => void,
        onHeaders?: (headers: Headers) => void,
        onError?: (error: Error) => void
    ) => Promise<void>;
    stopStreaming: () => void;
}

export const useStreaming = (): UseStreamingReturn => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
    }, []);

    const streamMessage = useCallback(
        async (
            message: string,
            threadId: string,
            onChunk: (chunk: string) => void,
            onComplete?: () => void,
            onHeaders?: (headers: Headers) => void,
            onError?: (error: Error) => void
        ) => {
            // Stop any existing stream
            stopStreaming();

            // Create new abort controller
            abortControllerRef.current = new AbortController();

            setIsStreaming(true);
            setError(null);

            try {
                await streamingApi.streamMessage(message, threadId, {
                    onMessage: (chunk: string) => {
                        onChunk(chunk);
                    },
                    onComplete: () => {
                        setIsStreaming(false);
                        onComplete?.();
                    },
                    onHeaders: onHeaders,
                    onError: (err: Error) => {
                        setError(err.message);
                        setIsStreaming(false);
                        onError?.(err);
                    },
                    signal: abortControllerRef.current.signal,
                });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                setIsStreaming(false);
            }
        },
        [stopStreaming]
    );

    return {
        isStreaming,
        error,
        streamMessage,
        stopStreaming,
    };
};