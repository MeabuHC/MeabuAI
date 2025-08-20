import React, { useEffect } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import CloseIcon from "../assets/svg/close.svg";
import { NotificationProps } from "../types/components";

const Notification: React.FC<NotificationProps> = ({
  message,
  visible,
  onClose,
  duration = 3000,
}) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-50);

  useEffect(() => {
    if (visible) {
      // Show notification
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="absolute top-2 left-4 right-4"
    >
      <View className="bg-gray-100 rounded-2xl px-2 py-3 flex-row items-center border-solid border-2 border-[#ECECEC] gap-4">
        <TouchableOpacity
          onPress={hideNotification}w
          className="ml-3 w-6 h-6 bg-gray-300 rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <CloseIcon width={14} height={14} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-black font-medium text-base">{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default Notification;
