// Chat Components
export interface ChatHeaderProps {
    conversationId: string;
}

export interface ChatInputProps {
    text: string;
    onTextChange: (text: string) => void;
    onSend: () => void;
    onAddPress: () => void;
}

export interface ChatScreenProps {
    route: {
        params?: {
            conversationId?: string;
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
}

// API message model
export interface UiMessagePart {
    type: string;
    text?: string;
}

export interface UiMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | string;
    content: string;
    createdAt: string;
    parts?: UiMessagePart[];
    experimental_attachments?: any[];
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
    onNewChatPress?: () => void;
    onSearch?: (searchText: string) => void;
}

export interface CustomDrawerContentProps {
    state: any;
    navigation: any;
    descriptors: any;
}

// Conversation Components
export interface Conversation {
    id: string;
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
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string; // or Date if you parse it
    parts: MessagePart[];
    experimental_attachments: any[]; // refine later if you know the structure
}
