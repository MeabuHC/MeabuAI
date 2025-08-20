import React, { useState } from "react";
import { Text, View } from "react-native";
import { UserMessageProps } from "../types/components";

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const [isWrapped, setIsWrapped] = useState(false);

  const handleTextLayout = (event: any) => {
    const { lines } = event.nativeEvent;
    setIsWrapped(lines.length > 1);
  };

  return (
    <View
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
    </View>
  );
};

export default React.memo(UserMessage);
