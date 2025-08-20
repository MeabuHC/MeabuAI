import { Ionicons } from "@expo/vector-icons";
import { useDrawerStatus } from "@react-navigation/drawer";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, TextInput, TouchableOpacity, View } from "react-native";
import NewChatIcon from "../assets/svg/new-chat.svg";
import { useAppSelector } from "../store/hooks";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerSearchBarProps } from "../types/components";

const DrawerSearchBar: React.FC<DrawerSearchBarProps> = ({
  onNewChatPress,
  onSearch,
}) => {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInput>(null);
  const drawerStatus = useDrawerStatus();

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onSearch?.(text);
  };

  // Listen for drawer status changes to dismiss keyboard when closed
  useEffect(() => {
    if (drawerStatus === "closed" && searchInputRef.current) {
      searchInputRef.current.blur();
      Keyboard.dismiss();
    }
  }, [drawerStatus]);

  return (
    <View
      className="flex-row items-center px-4 gap-4 py-6"
      style={{ paddingTop: insets.top }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "#222" : "#ededed",
          height: 36,
          paddingHorizontal: 12,
          borderRadius: 10,
        }}
        className="flex-1"
      >
        <Ionicons
          name="search"
          size={18}
          color={isDark ? "#b0b0b0" : "#9ca3af"}
          style={{ marginRight: 6 }}
        />
        <TextInput
          ref={searchInputRef}
          style={{
            flex: 1,
            fontSize: 16,
            color: isDark ? "#fff" : "#222",
            paddingVertical: 0,
            paddingHorizontal: 0,
            backgroundColor: "transparent",
          }}
          placeholder="Search"
          placeholderTextColor={isDark ? "#b0b0b0" : "#9ca3af"}
          value={searchText}
          onChangeText={handleSearchChange}
          onBlur={() => Keyboard.dismiss()}
          underlineColorAndroid="transparent"
          selectionColor={isDark ? "#fff" : "#222"}
        />
      </View>
      {/* Right - New Chat Icon */}
      <TouchableOpacity onPress={onNewChatPress}>
        <NewChatIcon width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
};

export default DrawerSearchBar;
