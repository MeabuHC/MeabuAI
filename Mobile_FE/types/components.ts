// Conversation Components
export interface ConversationHeaderProps {
    conversationId: string;
}

export interface ConversationInputProps {
    text: string;
    onTextChange: (text: string) => void;
    onSend: () => void;
    onAddPress: () => void;
}

export interface ConversationScreenProps {
    route: {
        params?: {
            conversationId?: string; // Keep for backwards compatibility, but will use localId internally
            localId?: string; // New preferred way to identify conversations
            initialMessageText?: string; // For new conversations with initial message text
        };
    };
}

// Message Components
export interface UserMessageProps {
    message: string;
}

export interface AIMessageProps {
    message: string;
    onCopy?: () => void;
    copyResetDuration?: number;
    isStreaming?: boolean;
}

// Notification Components
export interface NotificationProps {
    message: string;
    visible: boolean;
    onClose: () => void;
    duration?: number;
}

export interface ScrollToBottomButtonProps {
    visible: boolean;
    onPress: () => void;
}

// Drawer Components
export interface DrawerSearchBarProps {
    onNewConversationPress?: () => void;
    onSearch?: (searchText: string) => void;
}

export interface CustomDrawerContentProps {
    state: any;
    navigation: any;
    descriptors: any;
}

// Conversation Components
export interface Conversation {
    id?: string; // This is the conversationId from backend, undefined for new conversations
    localId: string; // Always exists, generated on frontend for new conversations
    resourceId: string;
    title: string;
    metadata: any | null;
    createdAt: string;
    updatedAt: string;
}

// Navigation Types
export type NavigationProp = {
    navigate: (
        screen: keyof import('./navigation').RootStackParamList,
        params: import('./navigation').RootStackParamList[keyof import('./navigation').RootStackParamList]
    ) => void;
};

type MessagePart =
    | { type: "text"; text: string }
    | { type: "step-start" };

export type UIMessage = {
    id?: string;
    localId: string;
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string; // or Date if you parse it
    parts: MessagePart[];
    experimental_attachments: any[]; // refine later if you know the structure
    status: "completed" | "streaming" | "error" | "cancelled" | "pending";
}
