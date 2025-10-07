import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ScrollToBottomButtonProps } from "../types/components";

const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  onPress,
}) => {
  const scale = useSharedValue(0);
  const measuredHeight = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(visible ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - scale.value) * (measuredHeight.value / 2) },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={style}
      className="absolute bottom-28 left-0 right-0 items-center"
    >
      <TouchableOpacity
        onLayout={(e) => {
          measuredHeight.value = e.nativeEvent.layout.height;
        }}
        className="bg-white rounded-full p-[6px] shadow-lg opacity-80"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-down" size={24} color="#000000" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ScrollToBottomButton;
