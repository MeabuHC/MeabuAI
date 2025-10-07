import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useNavigationState } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GptsIcon from "../assets/svg/gpts.svg";
import LibraryIcon from "../assets/svg/library.svg";
import LogoIcon from "../assets/svg/logo.svg";
import ConversationList from "../components/ConversationList";
import DrawerSearchBar from "../components/DrawerSearchBar";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchConversations } from "../store/slices/conversationsSlice";
import { CustomDrawerContentProps } from "../types/components";

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  const insets = useSafeAreaInsets();
  const navigationState = useNavigationState((state) => state);
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState("");
  const [pressedId, setPressedId] = useState<string | null>(null);

  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";
  const { isLoading } = useAppSelector((state) => state.conversations);

  // Get current conversation ID from navigation state
  const currentConversationParams = navigationState?.routes?.find(
    (route) => route.name === "Conversation"
  )?.params as { conversationId?: string; localId?: string } | undefined;

  const handleNewConversationPress = () => {
    props.navigation.navigate("Drawer", { screen: "Conversation" });
  };

  const handleRefresh = async () => {
    await dispatch(fetchConversations());
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* Search Bar */}
      <DrawerSearchBar
        onNewConversationPress={handleNewConversationPress}
        onSearch={setSearchText}
      />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#D3D3D3"
            colors={["#D3D3D3"]}
            progressBackgroundColor="#F5F5F5"
          />
        }
      >
        <View style={{ marginBottom: 30, paddingHorizontal: 4 }}>
          <Pressable
            className="flex-row py-[10px] gap-4 items-center rounded-2xl mb-2 px-4"
            style={{
              backgroundColor:
                pressedId === "meabuai"
                  ? "#F6F6F6"
                  : !currentConversationParams?.conversationId &&
                    !currentConversationParams?.localId
                  ? "#F6F6F6"
                  : "transparent",
            }}
            onPress={() =>
              props.navigation.navigate("Drawer", { screen: "Conversation" })
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
          currentLocalId={currentConversationParams?.localId}
          searchText={searchText}
          onSelectConversation={(conversation) =>
            props.navigation.navigate("Drawer", {
              screen: "Conversation",
              params: {
                localId: conversation.localId,
                conversationId: conversation.id,
              },
            })
          }
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
