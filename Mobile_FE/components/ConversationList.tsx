import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchConversations } from "../store/slices/conversationsSlice";
import { Conversation } from "../types/components";
import { RootStackParamList } from "../types/navigation";

interface ConversationListProps {
  currentLocalId?: string; // Use localId for identification
  searchText?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  currentLocalId,
  searchText = "",
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const { conversations, isLoading, error } = useAppSelector(
    (state) => state.conversations
  );
  const isDark = theme === "dark";
  const [pressedId, setPressedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Filter conversations based on search text
  const filteredConversations = (conversations || []).filter((conversation) =>
    conversation.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate("Drawer", {
      screen: "Conversation",
      params: {
        localId: conversation.localId,
        conversationId: conversation.id,
      },
    });
  };

  const renderConversation = (item: Conversation) => {
    const isActive = currentLocalId === item.localId;
    const isPressed = pressedId === item.localId;

    return (
      <Pressable
        key={item.localId}
        onPress={() => handleConversationPress(item)}
        className="px-4 py-[8px] rounded-2xl mb-2"
        style={{
          backgroundColor: isPressed || isActive ? "#F6F6F6" : "transparent",
        }}
        onPressIn={() => setPressedId(item.localId)}
        onPressOut={() => setPressedId(null)}
      >
        <Text
          className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
      </Pressable>
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
      {filteredConversations.map(renderConversation)}
    </View>
  );
};

export default ConversationList;
