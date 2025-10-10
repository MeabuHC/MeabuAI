import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { UserMessageProps } from "../types/components";

const UserMessage: React.FC<UserMessageProps> = ({
  message,
  animateOnMount = true,
}) => {
  const [isWrapped, setIsWrapped] = useState(false);

  // Animation values - initialize based on animateOnMount to avoid first-frame jump
  const translateY = useSharedValue(animateOnMount ? 30 : 0);
  const opacity = useSharedValue(animateOnMount ? 0 : 1);

  useEffect(() => {
    if (!animateOnMount) return;
    // Start animation when component mounts - smooth slide up from bottom
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [animateOnMount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleTextLayout = (event: any) => {
    const { lines } = event.nativeEvent;
    setIsWrapped(lines.length > 1);
  };

  return (
    <Animated.View
      style={animatedStyle}
      className={`flex-row items-center bg-[#F3F3F3] ml-auto py-3 px-5 max-w-[70%] mr-4 ${
        isWrapped ? "rounded-[20px]" : "rounded-full"
      }`}
    >
      <Text
        className="text-[18px] leading-[28px]"
        selectable={true}
        onTextLayout={handleTextLayout}
        style={{
          fontFamily: "sans-serif",
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

export default React.memo(UserMessage);
