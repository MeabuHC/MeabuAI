import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import ChatScreen from "../screens/ChatScreen";
import { DrawerParamList } from "../types/drawer";
import CustomDrawerContent from "./CustomDrawerContent";

// Wrapper component to force remount when conversationId changes
const ChatScreenWrapper = ({ route }: any) => {
  const conversationId = route.params?.conversationId;
  return <ChatScreen key={conversationId || "new-chat"} route={route} />;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#ffffff",
          width: 320,
        },
        drawerActiveBackgroundColor: "#f3f4f6",
        drawerActiveTintColor: "#1f2937",
        drawerInactiveTintColor: "#6b7280",
      }}
    >
      {/* Chat screen */}
      <Drawer.Screen
        name="Chat"
        component={ChatScreenWrapper}
        options={{
          drawerLabel: "Chat",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
