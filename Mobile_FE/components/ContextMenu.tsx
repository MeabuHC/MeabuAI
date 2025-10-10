import { useActionSheet } from "@expo/react-native-action-sheet";
import React, { useEffect } from "react";
import {
  Alert,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import ArchiveIcon from "../assets/svg/archive-svgrepo-com.svg";
import FlagIcon from "../assets/svg/flag-svgrepo-com.svg";
import FolderIcon from "../assets/svg/folder-svgrepo-com.svg";
import PenIcon from "../assets/svg/pen-svgrepo-com.svg";
import TrashIcon from "../assets/svg/trash-red-outline.svg";
import UploadIcon from "../assets/svg/upload-minimalistic-svgrepo-com.svg";
import api from "../services/api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  removeConversation,
  updateConversationTitle,
} from "../store/slices/conversationsSlice";

interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  conversationTitle?: string;
  conversationId?: string; // backend id or localId; we'll resolve
  onNotify?: (message: string, durationMs?: number) => void;
  onNavigateNew?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  onClose,
  conversationTitle = "Conversation",
  conversationId,
  onNotify,
  onNavigateNew,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const menuHeight = useSharedValue(0);
  const MENU_WIDTH = 240; // keep in sync with style width
  const [measured, setMeasured] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((s) => s.conversations.conversations);
  const targetConversation = React.useMemo(() => {
    if (!conversationId) return undefined;
    return (
      conversations.find((c) => c.id === conversationId) ||
      conversations.find((c) => c.localId === conversationId)
    );
  }, [conversations, conversationId]);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setMeasured(false);
      // reset values before measuring to avoid pop
      scale.value = 0;
      opacity.value = 0;
    } else {
      // Animate out immediately
      scale.value = withTiming(0, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
      setTimeout(() => {
        setShouldRender(false);
      }, 230);
    }
  }, [visible]);

  // Start the open animation only after the menu is measured to prevent anchor jitter
  useEffect(() => {
    if (visible && measured) {
      scale.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [visible, measured]);

  const animatedStyle = useAnimatedStyle(() => ({
    // Scale around the top-right corner of the popup
    transform: [
      { translateX: MENU_WIDTH / 2 },
      { translateY: -menuHeight.value / 2 },
      { scale: scale.value },
      { translateX: -MENU_WIDTH / 2 },
      { translateY: menuHeight.value / 2 },
    ],
    opacity: opacity.value,
  }));

  const onMenuLayout = (e: LayoutChangeEvent) => {
    menuHeight.value = e.nativeEvent.layout.height;
    setMeasured(true);
  };

  const { showActionSheetWithOptions } = useActionSheet();

  const confirmDelete = () => {
    // Include a Cancel option and pass cancelButtonIndex to allow backdrop dismiss
    const options = ["Delete", "Cancel"];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        title: "Delete Chat",
        message:
          "This can't be undone. Visit your settings to delete any memories saved during this chat.",
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === destructiveButtonIndex) {
          const id = targetConversation?.id;
          const localId = targetConversation?.localId;
          if (!id || !localId) return;
          // Optimistic notification
          // Global notification via store handled in screen; fall back to prop if provided
          onNotify?.("Deleting chat...", 1500);
          // Fire-and-forget delete
          (async () => {
            try {
              await api.delete(`/ai/threads/${id}`);
              // Optimistically remove from store
              dispatch(removeConversation(localId));
            } catch {}
            onNotify?.("Deleted chat", 1500);
            // Navigate to fresh conversation screen
            onNavigateNew?.();
          })();
        }
        // If user taps outside, library calls back with undefined or cancel index – both are no-ops
      }
    );
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Overlay to close menu when tapping outside */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: -screenHeight,
          left: -screenWidth,
          width: screenWidth * 3,
          height: screenHeight * 3,
          zIndex: 40,
        }}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Context Menu Popup */}
      <Animated.View
        className="absolute top-12 right-4 bg-white rounded-2xl z-50"
        style={[
          { width: 240 },
          {
            // soft, blurred shadow
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 16,
          },
          animatedStyle,
        ]}
        onLayout={onMenuLayout}
      >
        {/* Conversation Title */}
        <View className="px-5 py-2 border-b border-gray-100">
          <Text className="text-sm text-gray-500">{conversationTitle}</Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center py-2.5 px-5 border-b border-gray-100"
          onPress={() => {
            onClose();
            Alert.alert("Share", "Share conversation functionality");
          }}
        >
          <Text className="text-lg flex-1">Share</Text>
          <View className="ml-2">
            <UploadIcon width={16} height={16} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-2.5 px-5 border-b border-gray-100"
          onPress={() => {
            onClose();
            Alert.alert("Add to project", "Add to project functionality");
          }}
        >
          <Text className="text-lg flex-1">Add to project</Text>
          <View className="ml-2">
            <FolderIcon width={16} height={16} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-2.5 px-5 border-b border-gray-100"
          onPress={() => {
            onClose();
            const current = (conversationTitle || "").trim();
            if (Platform.OS === "ios") {
              Alert.prompt(
                "Rename chat",
                undefined,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: async (text?: string) => {
                      const next = (text || "").trim();
                      if (!next || next === current) return;
                      const id = targetConversation?.id;
                      const localId = targetConversation?.localId;
                      if (!id || !localId) return;
                      // Optimistic UI update first
                      dispatch(
                        updateConversationTitle({ localId, title: next })
                      );
                      // Fire-and-forget API
                      try {
                        await api.patch(`/ai/threads/${id}`, { title: next });
                      } catch (e) {
                        console.warn("Rename failed, kept optimistic title");
                      }
                    },
                  },
                ],
                "plain-text",
                current
              );
            } else {
              Alert.alert(
                "Rename chat",
                "Rename is available on iOS right now."
              );
            }
          }}
        >
          <Text className="text-lg flex-1">Rename</Text>
          <View className="ml-2">
            <PenIcon width={16} height={16} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-2.5 px-5 border-b border-gray-100"
          onPress={() => {
            onClose();
            Alert.alert("Report", "Report conversation functionality");
          }}
        >
          <Text className="text-lg flex-1">Report</Text>
          <View className="ml-2">
            <FlagIcon width={16} height={16} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-2.5 px-5 border-b border-gray-100"
          onPress={() => {
            onClose();
            Alert.alert("Archive", "Archive conversation functionality");
          }}
        >
          <Text className="text-lg flex-1">Archive</Text>
          <View className="ml-2">
            <ArchiveIcon width={16} height={16} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-2.5 px-5"
          onPress={() => {
            onClose();
            confirmDelete();
          }}
        >
          <Text className="text-lg flex-1 text-red-600">Delete</Text>
          <View className="ml-2">
            <TrashIcon width={16} height={16} color="#ef4444" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default ContextMenu;
