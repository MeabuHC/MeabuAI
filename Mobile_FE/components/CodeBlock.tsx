import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import CodeHighlighter from "react-native-code-highlighter";
import { atelierDuneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

import CheckIcon from "../assets/svg/check.svg";
import CopyIcon from "../assets/svg/copy.svg";

interface CodeBlockProps {
  language: string;
  content: string;
  nodeKey: string | number;
}

const customStyle = {
  ...atelierDuneLight,
  hljs: { backgroundColor: "transparent" }, // override the background
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  content,
  nodeKey,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    if (isCopied) return;

    try {
      await Clipboard.setStringAsync(content);
      setIsCopied(true);
    } catch (error) {
      console.error("Failed to copy code:", error);
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
      }, 6000);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isCopied]);

  return (
    <View
      style={{
        borderRadius: 6,
        borderColor: "#DADADA",
        borderWidth: 1,
        marginVertical: 8,
      }}
    >
      {/* Header with language and copy button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#F0F0F0",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: "#000",
            fontWeight: "500",
          }}
        >
          {language}
        </Text>
        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={isCopied ? 1 : 0.7}
          disabled={isCopied}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          {isCopied ? (
            <CheckIcon width={14} height={14} />
          ) : (
            <CopyIcon width={14} height={14} />
          )}
          <Text
            style={{
              fontSize: 12,
              color: "#586069",
              marginLeft: 4,
            }}
          >
            {isCopied ? "Copied" : "Copy"}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Code content */}
      {/* <View
        style={{
          backgroundColor: "transparent",
          paddingTop: 12,
          paddingHorizontal: 12,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
        }}
      >
        <Text
          style={{
            fontFamily: Platform.select({
              ios: "Menlo",
              android: "monospace",
              default: "monospace",
            }),
            fontSize: 14,
            color: "#24292e",
            lineHeight: 20,
          }}
        >
          {content}
        </Text>
      </View> */}
      <View
        style={{
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          overflow: "hidden",
          flex: 0,
          alignSelf: "stretch",
        }}
      >
        <CodeHighlighter
          hljsStyle={customStyle}
          language={language.toLowerCase()}
          textStyle={{
            fontFamily: Platform.select({
              ios: "Menlo",
              android: "monospace",
              default: "monospace",
            }),
            fontSize: 14,
            lineHeight: 20,
          }}
          scrollViewProps={{
            contentContainerStyle: {
              paddingHorizontal: 12,
              paddingTop: 12,
            },
            style: {
              flexGrow: 0,
              flexShrink: 0,
              flex: 0,
            },
            showsVerticalScrollIndicator: false,
            showsHorizontalScrollIndicator: true,
            scrollEnabled: true,
            horizontal: true,
            nestedScrollEnabled: false,
          }}
        >
          {content}
        </CodeHighlighter>
      </View>
    </View>
  );
};

export default CodeBlock;
