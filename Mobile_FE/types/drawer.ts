export type DrawerParamList = {
  Conversation: {
    conversationId?: string; // Keep for backwards compatibility
    localId?: string; // New preferred way
  };
  // Add more screens here as needed
  Settings: undefined;
  Profile: undefined;
}; 