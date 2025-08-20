import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useApi } from "../hooks/useApi";
import api from "../services/api";
import { useAppSelector } from "../store/hooks";
import { Conversation } from "../types/components";
import { RootStackParamList } from "../types/navigation";

const mockConversations: Conversation[] = [
  {
    id: "12346",
    resourceId: "SOME_USER_ID",
    title: "Hue City Weather",
    metadata: null,
    createdAt: "2025-07-19T03:50:43.809Z",
    updatedAt: "2025-07-18T20:52:06.676Z",
  },
  {
    id: "123456",
    resourceId: "SOME_USER_ID",
    title: "Hue School Day",
    metadata: null,
    createdAt: "2025-07-14T09:11:46.258Z",
    updatedAt: "2025-07-14T09:11:46.258Z",
  },
];

interface ConversationListProps {
  currentConversationId?: string;
  searchText?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  currentConversationId,
  searchText = "",
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";
  const [pressedId, setPressedId] = useState<string | null>(null);

  const {
    data: conversations,
    isLoading,
    error,
    execute: fetchConversations,
  } = useApi<Conversation[]>(() =>
    api.get("/ai/resources/me/threads").then((res) => res.data)
  );

  useEffect(() => {
    fetchConversations();
  }, []);

  // Filter conversations based on search text
  const filteredConversations = (conversations || []).filter((conversation) =>
    conversation.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate("Drawer", {
      screen: "Chat",
      params: { conversationId },
    });
  };

  const renderConversation = (item: Conversation) => {
    const isActive = currentConversationId === item.id;
    const isPressed = pressedId === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => handleConversationPress(item.id)}
        className="px-4 py-[8px] rounded-2xl mb-2"
        style={{
          backgroundColor: isPressed || isActive ? "#F6F6F6" : "transparent",
        }}
        onPressIn={() => setPressedId(item.id)}
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

  if (isLoading) {
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
