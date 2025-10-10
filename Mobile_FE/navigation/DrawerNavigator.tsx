import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React, { useRef } from "react";
import { Dimensions } from "react-native";
import SettingsSheet from "../components/SettingsSheet";
import ConversationScreen from "../screens/ConversationScreen";
import { DrawerParamList } from "../types/drawer";
import CustomDrawerContent from "./CustomDrawerContent";

// Wrapper component to force remount when localId or conversationId changes
const ConversationScreenWrapper = ({ route }: any) => {
  const localId = route.params?.localId;
  const conversationId = route.params?.conversationId;
  // Use localId as primary key, fallback to conversationId for backwards compatibility
  const key = localId || conversationId || "new-conversation";
  return <ConversationScreen key={key} route={route} />;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  const settingsRef = useRef<any>(null);

  return (
    <>
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            onOpenSettings={() => settingsRef.current?.expand?.()}
          />
        )}
        screenOptions={{
          headerShown: false,
          // Enable full-screen horizontal swipe to open/close drawer
          swipeEnabled: true,
          // Use screen width so swipe works anywhere, not just the edge
          swipeEdgeWidth: Dimensions.get("window").width,
          // Trigger with a tiny swipe; still full-screen edge width
          swipeMinDistance: 10,
          // Faster feel while still responsive
          gestureVelocityImpact: 0.6,
          drawerStyle: {
            backgroundColor: "#ffffff",
            width: 320,
          },
          drawerActiveBackgroundColor: "#f3f4f6",
          drawerActiveTintColor: "#1f2937",
          drawerInactiveTintColor: "#6b7280",
        }}
      >
        {/* Conversation screen */}
        <Drawer.Screen
          name="Conversation"
          component={ConversationScreenWrapper}
          options={{
            drawerLabel: "Conversation",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="chatbubble" color={color} size={size} />
            ),
          }}
        />
      </Drawer.Navigator>
      <SettingsSheet ref={settingsRef} />
    </>
  );
};

export default DrawerNavigator;
