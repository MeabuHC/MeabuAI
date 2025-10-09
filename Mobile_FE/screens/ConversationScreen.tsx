import { useApi } from "@/hooks/useApi";
import { useStreaming } from "@/hooks/useStreaming";
import api from "@/services/api";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import MessageErrorBanner from "../components/MessageErrorBanner";
import Notification from "../components/Notification";
import ScrollToBottomButton from "../components/ScrollToBottomButton";
import SuggestionCarousel, {
  SUGGESTION_CARDS,
  SuggestionCard,
} from "../components/SuggestionCarousel";
import UserMessage from "../components/UserMessage";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addConversation,
  updateConversationDetails,
  updateConversationId,
} from "../store/slices/conversationsSlice";
import {
  Conversation,
  ConversationScreenProps,
  UIMessage,
} from "../types/components";
import { DrawerParamList } from "../types/drawer";
import { cleanupText } from "../utils/textUtils";
const ConversationScreen: React.FC<ConversationScreenProps> = ({ route }) => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);
  const isDark = theme === "dark";
  const [text, setText] = useState("");
  const [hasActiveError, setHasActiveError] = useState(false);

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

  // Hold the real thread id received from headers until stream completes
  const newThreadIdRef = useRef<string | null>(null);

  // Helpers to keep streaming updates DRY (defined after setMessages is available)
  const appendChunkToLastAssistant = useCallback(
    (chunk: string) => {
      setMessages((prev) => {
        if (!prev) return [];

        const updatedMessages = [...prev];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content += chunk;
          lastMessage.status = "streaming";

          if (lastMessage.parts.length === 0) {
            lastMessage.parts = [{ type: "text", text: lastMessage.content }];
          } else {
            lastMessage.parts[0] = { type: "text", text: lastMessage.content };
          }
        }

        return updatedMessages;
      });
    },
    [setMessages]
  );

  const markLastAssistantCompleted = useCallback(() => {
    setMessages((prev) => {
      if (!prev) return [];

      const updatedMessages = [...prev];
      const lastMessage = updatedMessages[updatedMessages.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.status = "completed";
      }

      return updatedMessages;
    });
  }, [setMessages]);

  const markLastAssistantError = useCallback(
    (type?: UIMessage["errorType"], errorMessage?: string) => {
      setMessages((prev) => {
        if (!prev) return [];

        const updatedMessages = [...prev];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.status = "error";
          if (type) lastMessage.errorType = type;
          if (errorMessage) lastMessage.errorMessage = errorMessage;
        }

        return updatedMessages;
      });
      setHasActiveError(true);
    },
    [setMessages]
  );

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

        const newResponse: UIMessage = {
          content: "",
          role: "assistant",
          createdAt: new Date().toISOString(),
          parts: [],
          experimental_attachments: [],
          localId: uuidv4(),
          status: "pending",
          conversationId: localConversationId || "",
          animateOnMountOnce: true,
        };

        setMessages([newMessage, newResponse]);

        // Kick off streaming for the initial message
        const threadId = localConversationId || conversationId || "";
        streamMessage(
          initialMessageText,
          threadId,
          (chunk: string) => appendChunkToLastAssistant(chunk),
          () => {
            // On completion, mark the message as completed
            markLastAssistantCompleted();
            // Update title and timestamps after backend finishes generating them
            const effectiveThreadId =
              newThreadIdRef.current ||
              conversationId ||
              localConversationId ||
              "";
            if (effectiveThreadId) {
              api
                .get(`/ai/threads/${effectiveThreadId}`)
                .then((res) => {
                  const t = res.data;
                  dispatch(
                    updateConversationDetails({
                      localId: localConversationId!,
                      id: t.id,
                      title: t.title,
                      createdAt: t.createdAt,
                      updatedAt: t.updatedAt,
                      resourceId: t.resourceId,
                      metadata: t.metadata ?? null,
                    })
                  );
                })
                .catch(() => {})
                .finally(() => {
                  newThreadIdRef.current = null;
                });
            }
          },
          (headers: Headers) => {
            const newThreadId =
              headers.get("X-Thread-Id") || headers.get("x-thread-id");
            if (newThreadId && !conversationId) {
              newThreadIdRef.current = newThreadId;
              dispatch(
                updateConversationId({
                  localId: localConversationId!,
                  id: newThreadId,
                })
              );
            }
          }
        );
      } else {
        setMessages([]); // Clear messages for new conversation
      }
    }
  }, []);

  const flatListRef = useRef<FlatList>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // When keyboard appears, if user is already at bottom, snap to bottom (no animation)
  useEffect(() => {
    const onShow = () => {
      if (!isAtBottom) return;

      const scrollNow = () => {
        console.log("Scrolling to end");
        flatListRef.current?.scrollToEnd({ animated: false });
      };

      if (Platform.OS === "ios") {
        // Ensure FlatList re-layout occurs before scrolling
        requestAnimationFrame(() => requestAnimationFrame(scrollNow));
      } else {
        requestAnimationFrame(scrollNow);
      }
    };

    const sub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", onShow)
        : Keyboard.addListener("keyboardDidShow", onShow);

    return () => {
      sub.remove();
    };
  }, [isAtBottom]);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });
  const [touchStartPosition, setTouchStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Notification duration constant
  const NOTIFICATION_DURATION = 3000;

  const sendImmediate = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    if (!localConversationId) {
      // Generate a new localId for new conversations and pass the message text
      const newLocalId = uuidv4();

      // Clean up the text before processing
      const cleanedText = cleanupText(rawText.trim());

      // Create a temporary chat entry for the conversation list
      const temporaryConversation: Conversation = {
        localId: newLocalId,
        resourceId: "", // Empty for new chats
        title: "",
        metadata: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shouldList: false,
      };

      // Add the temporary chat to Redux store
      dispatch(addConversation(temporaryConversation));

      navigation.navigate("Conversation", {
        localId: newLocalId,
        initialMessageText: cleanedText,
      } as any);
      return;
    }
    if (rawText.trim()) {
      const messageText = cleanupText(rawText.trim());
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
        animateOnMountOnce: true,
      };

      setMessages((prev) => [...(prev || []), newMessage, newResponse]);
      setText("");

      // Send message to AI stream with real-time updates
      streamMessage(
        messageText,
        threadId,
        (chunk: string) => appendChunkToLastAssistant(chunk),
        () => {
          // On completion, mark the message as completed
          markLastAssistantCompleted();
          const effectiveThreadId =
            newThreadIdRef.current ||
            conversationId ||
            localConversationId ||
            "";
          if (effectiveThreadId) {
            api
              .get(`/ai/threads/${effectiveThreadId}`)
              .then((res) => {
                const t = res.data;
                dispatch(
                  updateConversationDetails({
                    localId: localConversationId!,
                    id: t.id,
                    title: t.title,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                    resourceId: t.resourceId,
                    metadata: t.metadata ?? null,
                  })
                );
              })
              .catch(() => {})
              .finally(() => {
                newThreadIdRef.current = null;
              });
          }
        },
        (headers: Headers) => {
          const newThreadId =
            headers.get("X-Thread-Id") || headers.get("x-thread-id");
          if (newThreadId && !conversationId) {
            newThreadIdRef.current = newThreadId;
            navigation.setParams({ conversationId: newThreadId } as any);
            dispatch(
              updateConversationId({
                localId: localConversationId!,
                id: newThreadId,
              })
            );
          }
        }
      );

      Keyboard.dismiss();

      // Scroll to bottom after a short delay to ensure the new message is rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSend = () => {
    setHasActiveError(false);
    sendImmediate(text);
  };

  const handleCopy = useCallback(() => {
    setNotification({ visible: true, message: "Message copied" });
  }, []);

  const retryLast = useCallback(() => {
    const lastUser = (messages || [])
      .slice()
      .reverse()
      .find((m) => m.role === "user");
    if (lastUser?.content) {
      setHasActiveError(false);
      sendImmediate(lastUser.content);
    }
  }, [messages]);

  useEffect(() => {
    if (streamError) {
      const msg = String(streamError);
      const isOffline = /network|offline|internet/i.test(msg);
      const isTimeout = /timeout|time out|timed out|took too long/i.test(msg);
      const isServer = /5\d\d|internal server|server error/i.test(msg);
      const type = isOffline
        ? "network"
        : isTimeout
        ? "timeout"
        : isServer
        ? "server"
        : "unknown";
      markLastAssistantError(type as any, msg);
    }
  }, [streamError, markLastAssistantError]);

  const hideNotification = () => {
    setNotification({
      visible: false,
      message: "",
    });
  };

  // This function runs when the user scrolls in a ScrollView or FlatList
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Determine if user is at or near the bottom
    const paddingToBottom = 20; // how close is "at bottom"
    const atBottom =
      contentOffset.y + layoutMeasurement.height >=
      contentSize.height - paddingToBottom;

    setIsAtBottom(atBottom);

    // Keep the scroll-to-bottom button logic
    const isScrolledUp =
      contentOffset.y < contentSize.height - layoutMeasurement.height - 450;
    setShowScrollToBottom(isScrolledUp);
  };

  // Handle touch start to track position
  const handleTouchStart = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setTouchStartPosition({ x: pageX, y: pageY });
  };

  // Handle touch end to dismiss keyboard only if it was a tap (not a drag)
  const handleTouchEnd = (event: any) => {
    if (!touchStartPosition) return;

    const { pageX, pageY } = event.nativeEvent;
    const deltaX = Math.abs(pageX - touchStartPosition.x);
    const deltaY = Math.abs(pageY - touchStartPosition.y);

    // If the touch moved less than 10 pixels, consider it a tap
    const isTap = deltaX < 10 && deltaY < 10;

    if (isTap) {
      Keyboard.dismiss();
    }

    setTouchStartPosition(null);
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
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              scrollEventThrottle={16}
              renderItem={({ item }: { item: UIMessage }) =>
                item.role === "user" ? (
                  <UserMessage message={item.content} />
                ) : item.status === "pending" ? (
                  <BreathingIndicator />
                ) : (
                  <>
                    <AIMessage
                      message={item.content}
                      onCopy={handleCopy}
                      copyResetDuration={NOTIFICATION_DURATION}
                      isStreaming={item.status === "streaming"}
                      animateOnMount={item.animateOnMountOnce === true}
                    />
                    {item.status === "error" && (
                      <MessageErrorBanner
                        type={item.errorType || "unknown"}
                        message={item.errorMessage}
                        onRetry={retryLast}
                      />
                    )}
                  </>
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

          {/* Empty state touch area when no conversation */}
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

          {/* Suggestions carousel (only for new conversation), just above input */}
          {!conversationId && !localConversationId && (
            <View className="pb-2">
              <SuggestionCarousel
                data={SUGGESTION_CARDS}
                onSelect={(card: SuggestionCard) => sendImmediate(card.prompt)}
              />
            </View>
          )}

          {/* Bottom Input - Hide when there's an active error */}
          {!hasActiveError && (
            <ConversationInput
              text={text}
              onTextChange={setText}
              onSend={handleSend}
              onAddPress={() => {
                console.log("add pressed");
              }}
              isStreaming={isStreaming}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConversationScreen;
