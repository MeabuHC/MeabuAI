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
        const conversationsWithLocalId: Conversation[] = response.data
            .map((conv) => ({
                ...conv,
                localId: conv.id!, // Use backend id as localId (we know id exists from API)
            }))
            .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
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
                // Only add to visible list if shouldList !== false
                if (action.payload.shouldList === false) {
                    // keep it in state but not in the visible list order until promoted
                    state.conversations.push(action.payload);
                } else {
                    state.conversations.unshift(action.payload);
                }
            }
            // Always keep conversations sorted by updatedAt desc
            state.conversations.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        },
        updateConversationId: (
            state,
            action: PayloadAction<{ localId: string; id: string }>
        ) => {
            const conversation = state.conversations.find(
                c => c.localId === action.payload.localId
            );
            if (conversation) {
                conversation.id = action.payload.id;
                conversation.updatedAt = new Date().toISOString();
                // Promote temp conversation into list when it receives an id
                conversation.shouldList = true;
            }
            // Resort after update
            state.conversations.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        },
        updateConversationDetails: (
            state,
            action: PayloadAction<{
                localId: string;
                id: string;
                title: string;
                createdAt: string;
                updatedAt: string;
                resourceId?: string;
                metadata?: any | null;
            }>
        ) => {
            const conversation = state.conversations.find(
                c => c.localId === action.payload.localId
            );
            if (conversation) {
                conversation.id = action.payload.id;
                conversation.title = action.payload.title;
                conversation.createdAt = action.payload.createdAt;
                conversation.updatedAt = action.payload.updatedAt;
                if (action.payload.resourceId !== undefined) {
                    conversation.resourceId = action.payload.resourceId as any;
                }
                if (action.payload.metadata !== undefined) {
                    conversation.metadata = action.payload.metadata;
                }
            }
            // Resort after details update
            state.conversations.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
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
            // Resort after title change
            state.conversations.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
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

                // Fast lookup by id to sync fields (e.g., updatedAt)
                const idToApiConversation: Record<string, Conversation> = {} as any;
                for (const c of apiConversations) {
                    if (c.id) idToApiConversation[c.id] = c as Conversation;
                }

                // Remove conversations that exist locally with an ID but are no longer on the backend
                state.conversations = state.conversations.filter(localConv => {
                    // Keep temporary conversations (no id)
                    if (!localConv.id) return true;
                    // Keep conversations that still exist on backend
                    return apiConversationIds.includes(localConv.id);
                });

                // Update existing conversations' timestamp/title if returned by API
                state.conversations.forEach(localConv => {
                    if (!localConv.id) return; // skip temporary ones
                    const apiConv = idToApiConversation[localConv.id];
                    if (apiConv) {
                        // Sync key fields from API, but never move timestamps backwards
                        const localUpdated = new Date(localConv.updatedAt || 0).getTime();
                        const apiUpdated = new Date(apiConv.updatedAt || 0).getTime();
                        if (apiUpdated > localUpdated) {
                            localConv.updatedAt = apiConv.updatedAt;
                        }

                        const localCreated = new Date(localConv.createdAt || 0).getTime();
                        const apiCreated = new Date(apiConv.createdAt || 0).getTime();
                        if (apiCreated && (!localCreated || apiCreated < localCreated)) {
                            localConv.createdAt = apiConv.createdAt;
                        }
                        if (apiConv.title !== undefined && apiConv.title !== null) {
                            localConv.title = apiConv.title;
                        }
                        if (apiConv.metadata !== undefined) {
                            localConv.metadata = apiConv.metadata as any;
                        }
                        if ((apiConv as any).resourceId !== undefined) {
                            (localConv as any).resourceId = (apiConv as any).resourceId;
                        }
                    }
                });

                // Add new conversations that don't already exist
                const newConversations = apiConversations.filter(
                    (apiConv) =>
                        !state.conversations.some(conv => conv.id === apiConv.id)
                );

                // Add new API conversations to the end (temporary conversations stay at top)
                state.conversations.push(...newConversations);

                // Final resort by updatedAt desc
                state.conversations.sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch conversations';
            });
    },
});

export const {
    addConversation,
    updateConversationId,
    updateConversationDetails,
    removeConversation,
    updateConversationTitle,
    clearConversations,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;