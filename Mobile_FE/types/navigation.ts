export type RootStackParamList = {
    Login: undefined;
    Drawer: {
        screen?: keyof DrawerParamList;
        params?: any;
    };
};

export type DrawerParamList = {
    Chat: { conversationId?: string };
}; 