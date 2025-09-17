import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface BreathingIndicatorProps {
  size?: number;
  color?: string;
}

const BreathingIndicator: React.FC<BreathingIndicatorProps> = ({
  size = 18, // Match AIMessage fontSize
  color = "#000000",
}) => {
  const scale = useSharedValue(0.3);

  useEffect(() => {
    // Start the breathing animation
    scale.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true // Reverse (grow then shrink)
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="items-start py-2 px-5 flex-col gap-1 mb-2 mt-2">
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
            marginTop: 5, // Fine-tune vertical position to match text baseline
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export default BreathingIndicator;
