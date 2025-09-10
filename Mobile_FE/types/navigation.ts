export type RootStackParamList = {
    Login: undefined;
    Drawer: {
        screen?: keyof DrawerParamList;
        params?: any;
    };
};

export type DrawerParamList = {
    Conversation: {
        conversationId?: string; // Keep for backwards compatibility
        localId?: string; // New preferred way
        initialMessageText?: string; // For new conversations with initial message text
    };
}; 