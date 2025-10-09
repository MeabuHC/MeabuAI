import React from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const AnimatedHeadline: React.FC = () => {
  const phrases = [
    "Let’s play.",
    "MeabuAI",
    "Let’s create",
    "Let’s discover",
    "Let’s explore",
    "Let’s invent",
    "Let’s chit chat",
    "Let’s go",
  ];

  const [index, setIndex] = React.useState(0);
  const text = phrases[index];
  const [textWidth, setTextWidth] = React.useState(0);
  const [textHeight, setTextHeight] = React.useState(48);
  const dotRadius = 12;
  const horizontalOffset = 18;
  const endGap = dotRadius + 6;
  const sizeCache = React.useRef<Record<string, { w: number; h: number }>>({});

  React.useLayoutEffect(() => {
    const cached = sizeCache.current[text];
    if (cached) {
      setTextWidth(cached.w);
      setTextHeight(cached.h);
    }
  }, [text]);

  const revealWidth = useSharedValue(0);
  const dotX = useSharedValue(0);

  const advance = React.useCallback(() => {
    setIndex((prev) => (prev + 1) % phrases.length);
  }, [phrases.length]);

  React.useEffect(() => {
    const cached = sizeCache.current[text];
    const width = cached?.w ?? textWidth;
    if (!width || width <= 0) return;
    const centerX = width / 2 - horizontalOffset;
    dotX.value = centerX;
    revealWidth.value = 0;

    const forwardDuration = 1300;
    const backDuration = 900;
    dotX.value = withSequence(
      withTiming(width + endGap - horizontalOffset, {
        duration: forwardDuration,
        easing: Easing.inOut(Easing.cubic),
      }),
      withDelay(
        2000,
        withTiming(
          centerX,
          { duration: backDuration, easing: Easing.inOut(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(advance)();
          }
        )
      )
    );

    revealWidth.value = withSequence(
      withTiming(width, {
        duration: forwardDuration,
        easing: Easing.inOut(Easing.cubic),
      }),
      withDelay(
        2000,
        withTiming(0, {
          duration: backDuration,
          easing: Easing.inOut(Easing.cubic),
        })
      )
    );
  }, [index, advance, horizontalOffset, textWidth]);

  const textClipStyle = useAnimatedStyle(() => ({ width: revealWidth.value }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dotX.value - dotRadius + horizontalOffset }],
  }));

  return (
    <View className="flex-1 items-center justify-center">
      <Text
        className="text-4xl font-extrabold text-gray-900 opacity-0 absolute"
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          const h =
            e.nativeEvent.layout.height > 0
              ? e.nativeEvent.layout.height
              : textHeight;
          sizeCache.current[text] = { w, h };
          setTextWidth(w);
          setTextHeight(h);
        }}
      >
        {text}
      </Text>
      <View
        style={{ height: textHeight }}
        className="items-center justify-center"
      >
        <View
          style={{
            width: textWidth,
            height: textHeight,
            justifyContent: "center",
          }}
        >
          <Animated.View style={[{ overflow: "hidden" }, textClipStyle]}>
            <Text className="text-4xl font-extrabold text-gray-900">
              {text}
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              {
                position: "absolute",
                top: (textHeight - dotRadius * 2) / 2,
                width: dotRadius * 2,
                height: dotRadius * 2,
                borderRadius: dotRadius,
                backgroundColor: "#111111",
              },
              dotStyle,
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default AnimatedHeadline;
