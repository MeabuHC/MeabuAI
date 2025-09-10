import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIMessage } from '../../types/components';

interface MessagesState {
    byId: { [localId: string]: UIMessage };
    byConversation: { [conversationId: string]: string[] };
}

const initialState: MessagesState = {
    byId: {},
    byConversation: {},
};

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<UIMessage>) => {
            const message = action.payload;

            // Add message to byId using localId
            state.byId[message.localId] = message;

            // Add message localId to conversation's message list
            if (!state.byConversation[message.conversationId]) {
                state.byConversation[message.conversationId] = [];
            }

            // Only add if not already present
            if (!state.byConversation[message.conversationId].includes(message.localId)) {
                state.byConversation[message.conversationId].push(message.localId);
            }
        },

        updateMessage: (state, action: PayloadAction<{ localId: string; updates: Partial<UIMessage> }>) => {
            const { localId, updates } = action.payload;
            if (state.byId[localId]) {
                state.byId[localId] = { ...state.byId[localId], ...updates };
            }
        },

        removeMessage: (state, action: PayloadAction<string>) => {
            const localId = action.payload;
            const message = state.byId[localId];

            if (message) {
                // Remove from byId
                delete state.byId[localId];

                // Remove from conversation's message list
                const conversationMessages = state.byConversation[message.conversationId];
                if (conversationMessages) {
                    state.byConversation[message.conversationId] = conversationMessages.filter(
                        id => id !== localId
                    );
                }
            }
        },

        setConversationMessages: (state, action: PayloadAction<{ conversationId: string; messages: UIMessage[] }>) => {
            const { conversationId, messages } = action.payload;

            // Clear existing messages for this conversation
            const existingLocalIds = state.byConversation[conversationId] || [];
            existingLocalIds.forEach(localId => {
                delete state.byId[localId];
            });

            // Add new messages
            const newLocalIds: string[] = [];
            messages.forEach(message => {
                state.byId[message.localId] = message;
                newLocalIds.push(message.localId);
            });

            state.byConversation[conversationId] = newLocalIds;
        },

        clearConversationMessages: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            const localIds = state.byConversation[conversationId] || [];

            // Remove all messages from byId
            localIds.forEach(localId => {
                delete state.byId[localId];
            });

            // Clear conversation's message list
            delete state.byConversation[conversationId];
        },

        clearAllMessages: (state) => {
            state.byId = {};
            state.byConversation = {};
        },
    },
});

export const {
    addMessage,
    updateMessage,
    removeMessage,
    setConversationMessages,
    clearConversationMessages,
    clearAllMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
