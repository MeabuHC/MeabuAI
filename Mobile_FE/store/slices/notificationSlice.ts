import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type NotificationState = {
    visible: boolean;
    message: string;
    duration?: number;
    hideCloseButton?: boolean;
    useTrashIcon?: boolean;
};

const initialState: NotificationState = {
    visible: false,
    message: '',
    duration: 3000,
    hideCloseButton: false,
    useTrashIcon: false,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        showNotification: (state, action: PayloadAction<Partial<NotificationState> & { message: string }>) => {
            state.visible = true;
            state.message = action.payload.message;
            if (action.payload.duration !== undefined) state.duration = action.payload.duration;
            state.hideCloseButton = !!action.payload.hideCloseButton;
            state.useTrashIcon = !!action.payload.useTrashIcon;
        },
        hideNotification: (state) => {
            state.visible = false;
            state.message = '';
            state.hideCloseButton = false;
            state.useTrashIcon = false;
        },
    },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

