import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchConversations } from "../store/slices/conversationsSlice";
import { Conversation } from "../types/components";
import { RootStackParamList } from "../types/navigation";

interface ConversationListProps {
  currentLocalId?: string; // Use localId for identification
  searchText?: string;
  onSelectConversation?: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  currentLocalId,
  searchText = "",
  onSelectConversation,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const { conversations, isLoading, error } = useAppSelector(
    (state) => state.conversations
  );
  const isDark = theme === "dark";
  // Removed pressed state to avoid rerender stealing first tap
  // Track previous titles per conversation to detect empty -> non-empty transitions
  const prevTitlesRef = useRef<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Initialize prevTitlesRef with current titles to prevent animation on first load
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      conversations.forEach((conv) => {
        if (conv.title && !prevTitlesRef.current[conv.localId]) {
          prevTitlesRef.current[conv.localId] = conv.title;
        }
      });
    }
  }, [conversations]);

  // Filter only; ordering handled in store (sorted by updatedAt desc)
  const filteredConversations = (conversations || [])
    .filter((conversation) => conversation.shouldList !== false)
    .filter((conversation) =>
      conversation.title.toLowerCase().includes(searchText.toLowerCase())
    );

  const handleConversationPress = (conversation: Conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation);
      return;
    }
    navigation.navigate("Drawer", {
      screen: "Conversation",
      params: {
        localId: conversation.localId,
        conversationId: conversation.id,
      },
    });
  };

  const ConversationRow: React.FC<{
    item: Conversation;
    shouldStagger: boolean;
    onTitleSeen: () => void;
  }> = ({ item, shouldStagger, onTitleSeen }) => {
    const isActive = currentLocalId === item.localId;

    // Title entrance animation when it changes from empty to non-empty
    const prevTitleRef = useRef(item.title);
    const [animateKey, setAnimateKey] = useState(0);
    const [showAnimated, setShowAnimated] = useState(shouldStagger);

    useEffect(() => {
      const prevTitle = prevTitleRef.current;
      if (!prevTitle && item.title) {
        // trigger remount of word components to run their entrance animations
        setAnimateKey((k) => k + 1);
        setShowAnimated(true);
        // auto-switch back to single-line Text after animation finishes to restore ellipsis
        const words = item.title.split(/\s+/).filter(Boolean).length;
        const totalMs = Math.min(1500, words * 100 + 300);
        const t = setTimeout(() => setShowAnimated(false), totalMs);
        return () => clearTimeout(t);
      }
      prevTitleRef.current = item.title;
      onTitleSeen();
    }, [item.title]);

    const Word: React.FC<{ text: string; index: number; akey: number }> = ({
      text,
      index,
      akey,
    }) => {
      const opacity = useSharedValue(0);
      const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
      useEffect(() => {
        // stagger like toolbar icons (100ms per word)
        opacity.value = 0;
        opacity.value = withDelay(
          index * 100,
          withTiming(1, {
            duration: 300,
            easing: Easing.out(Easing.ease),
          })
        );
      }, [akey]);
      return (
        <Animated.Text
          style={style}
          className={`${isDark ? "text-white" : "text-gray-900"} text-lg`}
        >
          {text}
        </Animated.Text>
      );
    };

    return (
      <Animated.View layout={LinearTransition.springify()}>
        <Pressable
          onPress={() => handleConversationPress(item)}
          className="px-4 py-[8px] rounded-2xl mb-2"
          style={{
            backgroundColor: isActive ? "#F6F6F6" : "transparent",
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {showAnimated ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "nowrap",
                overflow: "hidden",
                maxWidth: "100%",
              }}
            >
              {(() => {
                const words = item.title.split(/\s+/).filter(Boolean);
                return words.map((w, i) => (
                  <View
                    key={`${animateKey}-${i}`}
                    style={{ flexDirection: "row" }}
                  >
                    <Word text={w} index={i} akey={animateKey} />
                    {/* space between words */}
                    {i < words.length - 1 ? (
                      <Text
                        className={`text-lg ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {" "}
                      </Text>
                    ) : null}
                  </View>
                ));
              })()}
            </View>
          ) : (
            <Text
              className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  if (isLoading && !conversations?.length) {
    return (
      <View className="flex-1 justify-center items-center px-4 py-[8px]">
        <ActivityIndicator size="small" color={isDark ? "white" : "gray"} />
      </View>
    );
  }

  if (error) {
    return;
  }

  if (!conversations || conversations.length === 0) {
    return;
  }

  return (
    <View className={`${isDark ? "bg-gray-900" : "bg-white"} px-1`}>
      {filteredConversations.map((c) => {
        const prevTitle = prevTitlesRef.current[c.localId];
        // Only animate if this is the first time we see a title for this conversation
        // (prevTitle is undefined, meaning we haven't seen this conversation before)
        const shouldStagger = prevTitle === undefined && c.title !== "";
        return (
          <ConversationRow
            key={c.localId}
            item={c}
            shouldStagger={shouldStagger}
            onTitleSeen={() => {
              prevTitlesRef.current[c.localId] = c.title;
            }}
          />
        );
      })}
    </View>
  );
};

export default ConversationList;
