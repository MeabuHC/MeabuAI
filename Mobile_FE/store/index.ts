import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import conversationsSlice from './slices/conversationsSlice';
import messagesSlice from './slices/messagesSlice';
import notificationSlice from './slices/notificationSlice';
import themeSlice from './slices/themeSlice';

export const store = configureStore({
    reducer: {
        theme: themeSlice,
        auth: authSlice,
        conversations: conversationsSlice,
        messages: messagesSlice,
        notification: notificationSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 