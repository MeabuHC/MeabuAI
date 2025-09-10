import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Conversation } from '../../types/components';

interface ConversationsState {
    conversations: Conversation[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ConversationsState = {
    conversations: [],
    isLoading: false,
    error: null,
};

// Async thunk for fetching conversations from API
export const fetchConversations = createAsyncThunk(
    'conversations/fetchConversations',
    async () => {
        // API returns conversations without localId
        const response = await api.get<Omit<Conversation, 'localId'>[]>("/ai/resources/me/threads");
        const conversationsWithLocalId: Conversation[] = response.data.map((conv) => ({
            ...conv,
            localId: conv.id!, // Use backend id as localId (we know id exists from API)
        }));
        return conversationsWithLocalId;
    }
);

const conversationsSlice = createSlice({
    name: 'conversations',
    initialState,
    reducers: {
        addConversation: (state, action: PayloadAction<Conversation>) => {
            // Check if conversation with same localId already exists
            const existingIndex = state.conversations.findIndex(
                conversation => conversation.localId === action.payload.localId
            );

            if (existingIndex >= 0) {
                // Update existing conversation
                state.conversations[existingIndex] = action.payload;
            } else {
                // Add new conversation to the beginning of the array
                state.conversations.unshift(action.payload);
            }
        },
        removeConversation: (state, action: PayloadAction<string>) => {
            state.conversations = state.conversations.filter(
                conversation => conversation.localId !== action.payload
            );
        },
        updateConversationTitle: (state, action: PayloadAction<{ localId: string; title: string }>) => {
            const conversation = state.conversations.find(
                conversation => conversation.localId === action.payload.localId
            );
            if (conversation) {
                conversation.title = action.payload.title;
                conversation.updatedAt = new Date().toISOString();
            }
        },
        clearConversations: (state) => {
            state.conversations = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;

                // action.payload is already properly typed as Conversation[]
                const apiConversations = action.payload;

                // Get API conversation IDs for comparison
                const apiConversationIds = apiConversations.map(conv => conv.id);

                // Remove conversations that exist locally with an ID but are no longer on the backend
                state.conversations = state.conversations.filter(localConv => {
                    // Keep temporary conversations (no id)
                    if (!localConv.id) return true;
                    // Keep conversations that still exist on backend
                    return apiConversationIds.includes(localConv.id);
                });

                // Add new conversations that don't already exist
                const newConversations = apiConversations.filter(
                    (apiConv) =>
                        !state.conversations.some(conv => conv.id === apiConv.id)
                );

                // Add new API conversations to the end (temporary conversations stay at top)
                state.conversations.push(...newConversations);
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch conversations';
            });
    },
});

export const {
    addConversation,
    removeConversation,
    updateConversationTitle,
    clearConversations,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;