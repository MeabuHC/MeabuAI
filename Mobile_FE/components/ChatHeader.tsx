import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import NewChatIcon from "../assets/svg/new-chat.svg";

interface ChatHeaderProps {
  onMenuPress?: () => void;
  onTitlePress?: () => void;
  onNewChatPress?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onMenuPress,
  onTitlePress,
  onNewChatPress,
}) => {
  return (
    <View className="flex-row justify-between items-center py-[10px] px-4">
      {/* Left - Hamburger */}
      <TouchableOpacity onPress={onMenuPress}>
        <Feather name="menu" size={24} color="#000" />
      </TouchableOpacity>

      {/* Center - Chat Title */}
      <TouchableOpacity
        className="flex-row items-center"
        onPress={onTitlePress}
      >
        <Text className="text-xl font-semibold">MeabuAI</Text>
      </TouchableOpacity>

      {/* Right - New Chat Icon */}
      <TouchableOpacity onPress={onNewChatPress}>
        <NewChatIcon width={22} height={22} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatHeader;
