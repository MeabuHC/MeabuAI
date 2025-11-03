import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DotsIcon from "../assets/svg/dots.svg";
import HamburgerMenuIcon from "../assets/svg/hamburger-menu.svg";
import NewChatIcon from "../assets/svg/new-chat.svg";
import StarIcon from "../assets/svg/star.svg";
import TemporaryChatActivateIcon from "../assets/svg/temporary-chat-activate.svg";
import TemporaryChatIcon from "../assets/svg/temporary-chat.svg";
import { useAppSelector } from "../store/hooks";
import { ConversationHeaderProps } from "../types/components";
import { DrawerParamList } from "../types/drawer";
import ContextMenu from "./ContextMenu";

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversationId,
  onNotify,
  onNavigateNew,
}) => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [isTemporaryChatActive, setIsTemporaryChatActive] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const conversations = useAppSelector((s) => s.conversations.conversations);
  const title = useMemo(() => {
    if (!conversationId) return "New Chat";
    const byId = conversations.find((c) => c.id === conversationId);
    if (byId?.title) return byId.title;
    const byLocal = conversations.find((c) => c.localId === conversationId);
    return byLocal?.title || "New Chat";
  }, [conversationId, conversations]);

  if (!conversationId) {
    return (
      <View className="flex-row items-center justify-between py-[10px] px-6 bg-white relative">
        {/* Left */}
        <TouchableOpacity
          className="p-2 -m-2"
          onPress={() => navigation.openDrawer()}
        >
          <HamburgerMenuIcon width={24} height={24} color="#000000" />
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
          className="p-2 -m-2"
          activeOpacity={0.3}
          onPress={() => setIsTemporaryChatActive(!isTemporaryChatActive)}
        >
          <View>
            {isTemporaryChatActive ? (
              <TemporaryChatActivateIcon
                key="temp-active"
                width={22}
                height={22}
              />
            ) : (
              <TemporaryChatIcon key="temp-inactive" width={22} height={22} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center py-[10px] px-6 bg-white border-b-[0.5px] border-gray-100">
      {/* Left - Hamburger */}
      <TouchableOpacity
        className="p-2 -m-2"
        onPress={() => navigation.openDrawer()}
      >
        <HamburgerMenuIcon width={24} height={24} color="#000000" />
      </TouchableOpacity>

      {/* Center - Chat Title */}
      <View className="flex-1 mx-4">
        <Text
          className="text-xl font-semibold text-center"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title && conversationId ? title : "MeabuAI"}
        </Text>
      </View>

      {/* Right - Icons */}
      <View className="flex-row items-center gap-2">
        {/* New Chat Icon */}
        <TouchableOpacity
          className="p-2 -m-2"
          onPress={() => navigation.navigate("Conversation", {})}
        >
          <NewChatIcon width={22} height={22} color="#000000" />
        </TouchableOpacity>

        {/* Dots Icon with Context Menu */}
        <TouchableOpacity
          className="p-2 -m-2"
          onPress={() => setShowContextMenu(true)}
        >
          <DotsIcon width={16} height={22} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Context Menu */}
      <ContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        conversationTitle={title}
        conversationId={conversationId}
        onNotify={onNotify}
        onNavigateNew={onNavigateNew}
      />
    </View>
  );
};

export default ConversationHeader;
