import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DotsIcon from "../assets/svg/dots.svg";
import HamburgerMenuIcon from "../assets/svg/hamburger-menu.svg";
import NewChatIcon from "../assets/svg/new-chat.svg";
import StarIcon from "../assets/svg/star.svg";
import TemporaryChatActivateIcon from "../assets/svg/temporary-chat-activate.svg";
import TemporaryChatIcon from "../assets/svg/temporary-chat.svg";
import { ChatHeaderProps } from "../types/components";
import { DrawerParamList } from "../types/drawer";

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversationId }) => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [isTemporaryChatActive, setIsTemporaryChatActive] = useState(false);

  if (!conversationId) {
    return (
      <View className="flex-row items-center justify-between py-[10px] px-6 bg-white relative">
        {/* Left */}
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <HamburgerMenuIcon width={24} height={24} />
        </TouchableOpacity>

        {/* Middle - Absolute Center */}
        <View className="absolute left-0 right-0 items-center">
          <TouchableOpacity
            activeOpacity={0.6}
            className="flex-row items-center justify-center py-2 px-4 rounded-full"
            style={{ backgroundColor: "#F1F1FB" }}
          >
            <StarIcon width={14} height={14} fill="#5D5BD0" />
            <Text
              className="ml-2 text-base font-medium"
              style={{ color: "#5D5BD0" }}
            >
              Get Plus
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right */}
        <TouchableOpacity
          activeOpacity={0.3}
          onPress={() => setIsTemporaryChatActive(!isTemporaryChatActive)}
        >
          <View>
            {isTemporaryChatActive ? (
              <TemporaryChatActivateIcon width={22} height={22} />
            ) : (
              <TemporaryChatIcon width={22} height={22} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row justify-between items-center py-[10px] px-6 bg-white border-b-[0.5px] border-gray-100">
      {/* Left - Hamburger */}
      <View className="flex-row items-center gap-6">
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <HamburgerMenuIcon width={24} height={24} />
        </TouchableOpacity>

        {/* Center - Chat Title */}
        <View className="flex-row items-center">
          <Text className="text-xl font-semibold">MeabuAI</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-6">
        {/* Right - New Chat Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Chat", {})}>
          <NewChatIcon width={22} height={22} />
        </TouchableOpacity>

        {/* Right - Dots Icon */}
        <TouchableOpacity>
          <DotsIcon width={16} height={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatHeader;
