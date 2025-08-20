import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import CheckIcon from "../assets/svg/check.svg";
import CopyIcon from "../assets/svg/copy.svg";
import DislikeIcon from "../assets/svg/dislike.svg";
import LikeIcon from "../assets/svg/like.svg";
import RefreshIcon from "../assets/svg/refresh.svg";
import SoundIcon from "../assets/svg/sound.svg";
import UploadIcon from "../assets/svg/upload.svg";
import { useAppSelector } from "../store/hooks";
import { AIMessageProps } from "../types/components";

const AIMessage: React.FC<AIMessageProps> = ({
  message,
  onCopy,
  copyResetDuration = 3000,
}) => {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    if (isCopied) return; // Prevent multiple clicks

    try {
      await Clipboard.setStringAsync(message);
      setIsCopied(true);
      onCopy?.();
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  // Handle the timeout reset using useEffect
  useEffect(() => {
    if (isCopied) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, copyResetDuration);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isCopied, copyResetDuration]);

  return (
    <View className="items-center py-2 px-5 mr-4 flex-col gap-1">
      <Markdown
        style={{
          text: {
            fontSize: 18,
            lineHeight: 28,
            color: "#000",
            fontFamily: "sans-serif",
          },
          code_inline: {
            backgroundColor: "#ECECEC",
            color: "#0D0D0D",
            borderRadius: 3,
            fontSize: 18,
            fontFamily: "monospace",
          },
        }}
      >
        {message}
      </Markdown>
      <View className="flex-row items-center gap-4 mr-auto">
        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={isCopied ? 1 : 0.7}
          disabled={isCopied}
          className="p-2"
        >
          {isCopied ? (
            <CheckIcon width={16} height={16} />
          ) : (
            <CopyIcon width={16} height={16} />
          )}
        </TouchableOpacity>
        <View style={{ opacity: 0.7 }}>
          <TouchableOpacity activeOpacity={0.7} className="p-2">
            <SoundIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
        <View style={{ opacity: 0.7 }}>
          <TouchableOpacity activeOpacity={0.7} className="p-2">
            <LikeIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
        <View style={{ opacity: 0.7 }}>
          <TouchableOpacity activeOpacity={0.7} className="p-2">
            <DislikeIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
        <View style={{ opacity: 0.7 }}>
          <TouchableOpacity activeOpacity={0.7} className="p-2">
            <RefreshIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
        <View style={{ opacity: 0.7 }}>
          <TouchableOpacity activeOpacity={0.7} className="p-2">
            <UploadIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(AIMessage);
