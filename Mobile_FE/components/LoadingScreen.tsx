import React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Logo from "../assets/svg/logo.svg";

const LoadingScreen: React.FC = () => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true
    );
  }, []);

  const glowOpacity = useAnimatedStyle(() => ({
    opacity: 0.35 + progress.value * 0.65, // 0.35 -> 1 -> 0.35 (withRepeat auto-reverses)
  }));

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View style={{ width: 96, height: 96, position: "relative" }}>
        {/* Base icon (grey) */}
        <Logo width={96} height={96} fill="#D1D5DB" />

        {/* Glow overlay: fade from grey to black and back */}
        <Animated.View
          pointerEvents="none"
          style={[
            { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
            glowOpacity,
          ]}
        >
          <Logo width={96} height={96} fill="#111111" />
        </Animated.View>
      </View>
    </View>
  );
};

export default LoadingScreen;
