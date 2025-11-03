import * as Clipboard from "expo-clipboard";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import Markdown from "react-native-markdown-display";
// import { useAppSelector } from "../store/hooks";
import { AIMessageProps } from "../types/components";
import AnimatedToolbar from "./AnimatedToolbar";
import CodeBlock from "./CodeBlock";

const AIMessage: React.FC<AIMessageProps> = ({
  message,
  onCopy,
  copyResetDuration = 3000,
  isStreaming = false,
  animateOnMount = false,
  hideToolbar = false,
}) => {
  // const { theme } = useAppSelector((state) => state.theme);
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("AIMessage mounted");
  }, []);

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

  const markdownStyles = useMemo(
    () => ({
      text: {
        fontSize: 18,
        lineHeight: 28,
        color: "#000",
        fontFamily: Platform.select({
          ios: "System",
          android: "sans-serif",
          default: "System",
        }),
      },
      code_inline: {
        backgroundColor: "transparent",
        color: "#0D0D0D",
        borderRadius: 3,
        fontSize: 18,
        fontFamily: Platform.select({
          ios: "Menlo",
          android: "monospace",
          default: "monospace",
        }),
        fontStyle: "italic",
        paddingHorizontal: 8,
        paddingVertical: 2,
      },
      fence: {
        fontSize: 14,
        backgroundColor: "#f6f8fa",
        padding: 0,
        borderRadius: 6,
        marginVertical: 8,
      },
      bullet_list: {
        marginVertical: 8,
      },
      bullet_list_icon: {
        width: 6,
        height: 6,
        backgroundColor: "#333",
        borderRadius: 4,
        marginRight: 12,
        marginTop: 11, // Centers the bullet with the text
      },
      // Removed bullet_list_content due to RN style type constraints
      ordered_list: {
        marginVertical: 8,
      },
      ordered_list_icon: {
        fontSize: 16,
        color: "#333",
        fontWeight: "600",
        marginRight: 8,
        marginTop: 5,
        minWidth: 20,
        textAlign: "right",
      },
      // Removed ordered_list_content due to RN style type constraints
      // Removed list_item to satisfy RN markdown style typing
    }),
    []
  );

  const markdownRules = useMemo(
    () => ({
      fence: (node: any) => {
        const language = node?.sourceInfo || "text";
        const codeContent: string = node?.content ?? "";

        return (
          <CodeBlock
            key={node?.key}
            language={language}
            content={codeContent}
            nodeKey={node?.key}
          />
        );
      },
    }),
    []
  );

  return (
    <View className="items-start py-2 px-5 flex-col gap-1 mb-2">
      <Markdown style={markdownStyles} rules={markdownRules}>
        {message}
      </Markdown>
      {!isStreaming && !hideToolbar && (
        <AnimatedToolbar
          isVisible={true}
          animateOnMount={animateOnMount}
          isCopied={isCopied}
          onCopy={handleCopy}
        />
      )}
    </View>
  );
};

export default React.memo(AIMessage);
