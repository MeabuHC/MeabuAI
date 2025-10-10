import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import CloseIcon from "../assets/svg/close.svg";
import TrashIcon from "../assets/svg/trash-alt-svgrepo-com.svg";
import { NotificationProps } from "../types/components";

const Notification: React.FC<NotificationProps> = ({
  message,
  visible,
  onClose,
  duration = 3000,
  hideCloseButton = false,
  useTrashIcon = false,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    if (visible) {
      // Show notification
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideNotification = () => {
    opacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.in(Easing.ease),
    });
    translateY.value = withTiming(
      -50,
      {
        duration: 200,
        easing: Easing.in(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      }
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[animatedStyle]}
      className="absolute top-28 left-4 right-4"
    >
      <View className="bg-gray-100 rounded-2xl px-2 py-3 flex-row items-center border-solid border-1 border-[#ECECEC] gap-4">
        {hideCloseButton ? (
          <View className="ml-3 w-6 h-6 bg-gray-300 rounded-full items-center justify-center">
            {useTrashIcon ? (
              <TrashIcon width={14} height={14} />
            ) : (
              <CloseIcon width={14} height={14} />
            )}
          </View>
        ) : (
          <TouchableOpacity
            onPress={hideNotification}
            className="ml-3 w-6 h-6 bg-gray-300 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            {useTrashIcon ? (
              <TrashIcon width={14} height={14} />
            ) : (
              <CloseIcon width={14} height={14} />
            )}
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-black font-medium text-base">{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default Notification;
