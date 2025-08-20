import { useApi } from "@/hooks/useApi";
import api from "@/services/api";
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
import AIMessage from "../components/AIMessage";
import ChatHeader from "../components/ChatHeader";
import ChatInput from "../components/ChatInput";
import Notification from "../components/Notification";
import ScrollToBottomButton from "../components/ScrollToBottomButton";
import UserMessage from "../components/UserMessage";
import { useAppSelector } from "../store/hooks";
import { ChatScreenProps, UiMessage, UIMessage } from "../types/components";

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";
  const [text, setText] = useState("");

  // Get conversationId from route params
  const conversationId = route.params?.conversationId;

  const {
    data: messages,
    setData: setMessages,
    isLoading,
    execute: fetchMessages,
  } = useApi<UIMessage[]>(() =>
    api
      .get(`/ai/threads/${conversationId}/messages`)
      .then((res) => res.data.uiMessages)
  );

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    } else {
      console.log("New chat started");
    }
  }, [conversationId]);

  const flatListRef = useRef<FlatList>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });

  // Notification duration constant
  const NOTIFICATION_DURATION = 3000;

  const handleSend = () => {
    if (text.trim()) {
      const newMessage = {
        id: (messages?.length || 0) + 1,
        message: text.trim(),
        sender: "user",
      };
      setMessages((prev) => [...(prev || []), newMessage]);
      setText("");

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
          {/* Chat Header */}
          <View className="relative z-30">
            <ChatHeader conversationId={conversationId} />
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

          {/* Chat Messages */}
          {conversationId && (
            <FlatList
              ref={flatListRef}
              className="flex-1 pt-6"
              data={messages || []}
              onScroll={handleScroll}
              onScrollBeginDrag={() => Keyboard.dismiss()}
              scrollEventThrottle={16}
              renderItem={({ item }: { item: UiMessage }) =>
                item.role === "user" ? (
                  <UserMessage message={item.content} />
                ) : (
                  <AIMessage
                    message={item.content}
                    onCopy={handleCopy}
                    copyResetDuration={NOTIFICATION_DURATION}
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
              keyExtractor={(item) => item.id.toString()}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={10}
            />
          )}

          {/* Empty state - provides touch area for keyboard dismissal when no conversation */}
          {!conversationId && (
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
          <ChatInput
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

export default ChatScreen;
