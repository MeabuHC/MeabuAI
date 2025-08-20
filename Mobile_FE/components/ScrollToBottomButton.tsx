import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { ScrollToBottomButtonProps } from "../types/components";

const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  onPress,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      className="absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-[6px] shadow-lg opacity-80"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-down" size={24} color="#000000" />
    </TouchableOpacity>
  );
};

export default ScrollToBottomButton;
