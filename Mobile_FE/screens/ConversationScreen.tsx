import { useApi } from "@/hooks/useApi";
import { useStreaming } from "@/hooks/useStreaming";
import api from "@/services/api";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";
import AIMessage from "../components/AIMessage";
import BreathingIndicator from "../components/BreathingIndicator";
import ConversationHeader from "../components/ConversationHeader";
import ConversationInput from "../components/ConversationInput";
import Notification from "../components/Notification";
import ScrollToBottomButton from "../components/ScrollToBottomButton";
import UserMessage from "../components/UserMessage";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addConversation } from "../store/slices/conversationsSlice";
import { ConversationScreenProps, UIMessage } from "../types/components";
import { DrawerParamList } from "../types/drawer";
import { cleanupText } from "../utils/textUtils";

const ConversationScreen: React.FC<ConversationScreenProps> = ({ route }) => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);
  const isDark = theme === "dark";
  const [text, setText] = useState("");

  // Get conversationId (backend id) and localId from route params
  const conversationId = route.params?.conversationId;
  const localConversationId = route.params?.localId || conversationId; // Use localId if provided, otherwise fallback to conversationId for backwards compatibility
  const initialMessageText = route.params?.initialMessageText;

  const {
    data: messages,
    setData: setMessages,
    isLoading,
    execute: fetchMessages,
  } = useApi<UIMessage[]>(async () => {
    const response = await api.get(`/ai/threads/${conversationId}/messages`);
    // Map id to localId for each message
    const messagesWithLocalId = response.data.uiMessages.map(
      (message: any) => ({
        ...message,
        localId: message.id || uuidv4(), // Use API id as localId, or generate new one if missing
        status: message.status || "completed", // Default status if not provided
      })
    );
    return messagesWithLocalId;
  });

  const {
    isStreaming,
    error: streamError,
    streamMessage,
    stopStreaming,
  } = useStreaming();

  useEffect(() => {
    if (conversationId) {
      // We have a conversationId (backend id), fetch messages
      fetchMessages();
    } else if (localConversationId) {
      // We have a localId but no conversationId, this is a new conversation
      console.log(
        "New conversation started with localId:",
        localConversationId
      );

      if (initialMessageText) {
        // Create initial message from route params
        const newMessage: UIMessage = {
          content: initialMessageText,
          role: "user",
          createdAt: new Date().toISOString(),
          parts: [{ type: "text", text: initialMessageText }],
          experimental_attachments: [],
          status: "completed",
          localId: uuidv4(),
          conversationId: localConversationId || "",
        };
        setMessages([newMessage]);
      } else {
        setMessages([]); // Clear messages for new conversation
      }
    }
  }, []);

  const flatListRef = useRef<FlatList>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });

  // Notification duration constant
  const NOTIFICATION_DURATION = 3000;

  const handleSend = () => {
    if (!localConversationId) {
      // Generate a new localId for new conversations and pass the message text
      const newLocalId = uuidv4();

      // Clean up the text before processing
      const cleanedText = cleanupText(text.trim());

      // Create a temporary chat entry for the conversation list
      const temporaryConversation = {
        localId: newLocalId,
        resourceId: "", // Empty for new chats
        title:
          cleanedText.length > 50
            ? cleanedText.substring(0, 50) + "..."
            : cleanedText,
        metadata: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add the temporary chat to Redux store
      dispatch(addConversation(temporaryConversation));

      navigation.navigate("Conversation", {
        localId: newLocalId,
        initialMessageText: cleanedText,
      } as any);
      return;
    }
    if (text.trim()) {
      const messageText = cleanupText(text.trim());
      const threadId = localConversationId || conversationId || "";

      const newMessage: UIMessage = {
        content: messageText,
        role: "user",
        createdAt: new Date().toISOString(),
        parts: [{ type: "text", text: messageText }],
        experimental_attachments: [],
        localId: uuidv4(),
        status: "completed",
        conversationId: localConversationId || "",
      };

      const newResponse: UIMessage = {
        content: "",
        role: "assistant",
        createdAt: new Date().toISOString(),
        parts: [],
        experimental_attachments: [],
        localId: uuidv4(),
        status: "pending",
        conversationId: localConversationId || "",
      };

      setMessages((prev) => [...(prev || []), newMessage, newResponse]);
      setText("");

      // Send message to AI stream with real-time updates
      streamMessage(
        messageText,
        threadId,
        (chunk: string) => {
          console.log("🎯 Chunk received in UI:", chunk);
          // Update the assistant message with streaming content
          setMessages((prev) => {
            if (!prev) return [];

            const updatedMessages = [...prev];
            const lastMessage = updatedMessages[updatedMessages.length - 1];

            if (lastMessage && lastMessage.role === "assistant") {
              // Append chunk to existing content
              lastMessage.content += chunk;
              lastMessage.status = "streaming";

              // Update parts array for proper rendering
              if (lastMessage.parts.length === 0) {
                lastMessage.parts = [
                  { type: "text", text: lastMessage.content },
                ];
              } else {
                lastMessage.parts[0] = {
                  type: "text",
                  text: lastMessage.content,
                };
              }
            }

            return updatedMessages;
          });
        },
        () => {
          // On completion, mark the message as completed
          setMessages((prev) => {
            if (!prev) return [];

            const updatedMessages = [...prev];
            const lastMessage = updatedMessages[updatedMessages.length - 1];

            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.status = "completed";
            }

            return updatedMessages;
          });
        }
      );

      Keyboard.dismiss();

      // Scroll to bottom after a short delay to ensure the new message is rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCopy = () => {
    setNotification({
      visible: true,
      message: "Message copied",
    });
  };

  const hideNotification = () => {
    setNotification({
      visible: false,
      message: "",
    });
  };

  // This function runs when the user scrolls in a ScrollView or FlatList
  const handleScroll = (event: any) => {
    // Destructure the scroll position and sizes from the scroll event
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Check if the user is NOT near the bottom of the scroll view
    // Specifically, if the scroll position (contentOffset.y)
    // is at least 450 pixels above the bottom
    const isScrolledUp =
      contentOffset.y < contentSize.height - layoutMeasurement.height - 450;

    // Show the "scroll to bottom" button only when the user is scrolled up
    setShowScrollToBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Conversation Header */}
          <View className="relative z-30">
            <ConversationHeader
              conversationId={conversationId || localConversationId || ""}
            />
          </View>

          {/* Notification */}
          <View className="relative z-10">
            <Notification
              message={notification.message}
              visible={notification.visible}
              onClose={hideNotification}
              duration={NOTIFICATION_DURATION}
            />
          </View>

          {/* Conversation Messages */}
          {(conversationId || localConversationId) && (
            <FlatList
              ref={flatListRef}
              className="pt-6"
              data={messages || []}
              onScroll={handleScroll}
              onScrollBeginDrag={() => Keyboard.dismiss()}
              scrollEventThrottle={16}
              onContentSizeChange={() => {
                // Auto-scroll when content changes (for new messages)
                if (messages && messages.length > 0) {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }, 100);
                }
              }}
              renderItem={({ item }: { item: UIMessage }) =>
                item.role === "user" ? (
                  <UserMessage message={item.content} />
                ) : item.status === "pending" ? (
                  <BreathingIndicator />
                ) : (
                  <AIMessage
                    message={item.content}
                    onCopy={handleCopy}
                    copyResetDuration={NOTIFICATION_DURATION}
                    isStreaming={item.status === "streaming"}
                  />
                )
              }
              ListFooterComponent={<View style={{ height: 24 }} />}
              ListHeaderComponent={
                isLoading ? (
                  <View className="flex-1 justify-center items-center px-4 py-[10px]">
                    <ActivityIndicator
                      size="small"
                      color={isDark ? "white" : "gray"}
                    />
                  </View>
                ) : null
              }
              keyExtractor={(item) => item.localId.toString()}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={10}
            />
          )}

          {/* Empty state - provides touch area for keyboard dismissal when no conversation */}
          {!conversationId && !localConversationId && (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View className="flex-1" />
            </TouchableWithoutFeedback>
          )}

          {/* Sticky Scroll to Bottom Button */}
          <ScrollToBottomButton
            visible={showScrollToBottom}
            onPress={scrollToBottom}
          />

          {/* Bottom Input */}
          <ConversationInput
            text={text}
            onTextChange={setText}
            onSend={handleSend}
            onAddPress={() => {
              console.log("add pressed");
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConversationScreen;
