import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import CheckIcon from "../assets/svg/check.svg";
import CopyIcon from "../assets/svg/copy.svg";
import DislikeIcon from "../assets/svg/dislike.svg";
import LikeIcon from "../assets/svg/like.svg";
import RefreshIcon from "../assets/svg/refresh.svg";
import SoundIcon from "../assets/svg/sound.svg";
import UploadIcon from "../assets/svg/upload.svg";

interface AnimatedToolbarProps {
  isVisible: boolean; // controls presence; we keep it visible in UI
  isCopied: boolean;
  onCopy: () => void;
  animateOnMount?: boolean; // when true, run staggered animation; otherwise render static
}

const AnimatedToolbar: React.FC<AnimatedToolbarProps> = ({
  isVisible,
  isCopied,
  onCopy,
  animateOnMount = false,
}) => {
  // Animation values for toolbar icons
  const copyOpacity = useSharedValue(0);
  const soundOpacity = useSharedValue(0);
  const likeOpacity = useSharedValue(0);
  const dislikeOpacity = useSharedValue(0);
  const refreshOpacity = useSharedValue(0);
  const uploadOpacity = useSharedValue(0);

  // Animate toolbar icons once if requested; otherwise render fully visible
  useEffect(() => {
    if (!isVisible) {
      // If explicitly hidden, set to 0
      copyOpacity.value = 0;
      soundOpacity.value = 0;
      likeOpacity.value = 0;
      dislikeOpacity.value = 0;
      refreshOpacity.value = 0;
      uploadOpacity.value = 0;
      return;
    }

    if (animateOnMount) {
      copyOpacity.value = withDelay(
        100,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      );
      soundOpacity.value = withDelay(
        200,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      );
      likeOpacity.value = withDelay(
        300,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      );
      dislikeOpacity.value = withDelay(
        400,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      );
      refreshOpacity.value = withDelay(
        500,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      );
      uploadOpacity.value = withDelay(
        600,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      );
    } else {
      // No animation: show at full opacity
      copyOpacity.value = 1;
      soundOpacity.value = 1;
      likeOpacity.value = 1;
      dislikeOpacity.value = 1;
      refreshOpacity.value = 1;
      uploadOpacity.value = 1;
    }
  }, [isVisible, animateOnMount]);

  // Animated styles for each icon
  const copyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.value,
  }));

  const soundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: soundOpacity.value * 0.7,
  }));

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value * 0.7,
  }));

  const dislikeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dislikeOpacity.value * 0.7,
  }));

  const refreshAnimatedStyle = useAnimatedStyle(() => ({
    opacity: refreshOpacity.value * 0.7,
  }));

  const uploadAnimatedStyle = useAnimatedStyle(() => ({
    opacity: uploadOpacity.value * 0.7,
  }));

  return (
    <View className="flex-row items-center gap-4 mr-auto">
      <Animated.View style={copyAnimatedStyle}>
        <TouchableOpacity
          onPress={onCopy}
          activeOpacity={isCopied ? 1 : 0.7}
          disabled={isCopied}
          className="pr-2 pl-1"
        >
          {isCopied ? (
            <CheckIcon key="check" width={16} height={16} color="#374151" />
          ) : (
            <CopyIcon key="copy" width={16} height={16} color="#374151" />
          )}
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={soundAnimatedStyle}>
        <TouchableOpacity activeOpacity={0.7} className="p-2">
          <SoundIcon key="sound" width={16} height={16} color="#374151" />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={likeAnimatedStyle}>
        <TouchableOpacity activeOpacity={0.7} className="p-2">
          <LikeIcon key="like" width={16} height={16} color="#374151" />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={dislikeAnimatedStyle}>
        <TouchableOpacity activeOpacity={0.7} className="p-2">
          <DislikeIcon key="dislike" width={16} height={16} color="#374151" />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={refreshAnimatedStyle}>
        <TouchableOpacity activeOpacity={0.7} className="p-2">
          <RefreshIcon key="refresh" width={16} height={16} color="#374151" />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={uploadAnimatedStyle}>
        <TouchableOpacity activeOpacity={0.7} className="p-2">
          <UploadIcon key="upload" width={16} height={16} color="#374151" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default AnimatedToolbar;
