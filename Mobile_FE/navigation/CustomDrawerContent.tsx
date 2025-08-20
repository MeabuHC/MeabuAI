import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useNavigationState } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GptsIcon from "../assets/svg/gpts.svg";
import LibraryIcon from "../assets/svg/library.svg";
import LogoIcon from "../assets/svg/logo.svg";
import ConversationList from "../components/ConversationList";
import DrawerSearchBar from "../components/DrawerSearchBar";
import { useAppSelector } from "../store/hooks";
import { CustomDrawerContentProps } from "../types/components";

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  const insets = useSafeAreaInsets();
  const navigationState = useNavigationState((state) => state);
  const [searchText, setSearchText] = useState("");
  const [pressedId, setPressedId] = useState<string | null>(null);

  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";

  // Get current conversation ID from navigation state
  const currentConversationId = navigationState?.routes?.find(
    (route) => route.name === "Chat"
  )?.params as { conversationId: string } | undefined;

  const handleNewChatPress = () => {
    props.navigation.navigate("Drawer", { screen: "Chat" });
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* Search Bar */}
      <DrawerSearchBar
        onNewChatPress={handleNewChatPress}
        onSearch={setSearchText}
      />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 0 }}
      >
        <View style={{ marginBottom: 30, paddingHorizontal: 4 }}>
          <Pressable
            className="flex-row py-[10px] gap-4 items-center rounded-2xl mb-2 px-4"
            style={{
              backgroundColor:
                pressedId === "meabuai"
                  ? "#F6F6F6"
                  : !currentConversationId?.conversationId
                  ? "#F6F6F6"
                  : "transparent",
            }}
            onPress={() =>
              props.navigation.navigate("Drawer", { screen: "Chat" })
            }
            onPressIn={() => setPressedId("meabuai")}
            onPressOut={() => setPressedId(null)}
          >
            <LogoIcon width={24} height={24} />
            <Text className="text-lg font-medium ml-4">MeabuAI</Text>
          </Pressable>
          <Pressable
            className="flex-row py-[10px] gap-4 items-center rounded-2xl mb-2 px-4"
            style={{
              backgroundColor:
                pressedId === "library" ? "#F6F6F6" : "transparent",
            }}
            onPressIn={() => setPressedId("library")}
            onPressOut={() => setPressedId(null)}
          >
            <LibraryIcon width={24} height={24} />
            <Text className="text-lg font-medium ml-4">Library</Text>
          </Pressable>
          <Pressable
            className="flex-row py-[10px] gap-4 items-center rounded-2xl mb-2 px-4"
            style={{
              backgroundColor: pressedId === "gpts" ? "#F6F6F6" : "transparent",
            }}
            onPressIn={() => setPressedId("gpts")}
            onPressOut={() => setPressedId(null)}
          >
            <GptsIcon width={24} height={24} />
            <Text className="text-lg font-medium ml-4">Gpts</Text>
          </Pressable>
        </View>
        <ConversationList
          currentConversationId={currentConversationId?.conversationId}
          searchText={searchText}
        />
      </DrawerContentScrollView>

      {/* Fixed footer */}
      <LinearGradient
        colors={["#F7F7F7", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        {/* Avatar */}
        <Image
          source={require("../assets/images/Rika.jpg")}
          style={{ width: 40, height: 40, borderRadius: 100 }}
        />

        {/* Name */}
        <Text
          className={`ml-3 text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Hoang Cong Minh
        </Text>
      </LinearGradient>
    </View>
  );
};

export default CustomDrawerContent;
