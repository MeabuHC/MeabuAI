import React from "react";
import { Text, View } from "react-native";

interface AIMessageProps {
  message: string;
}

const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  return (
    <View className="flex-row items-center py-3 px-5 mr-4 mb-4">
      <Text className="text-[18px] leading-[30px]" selectable={true}>
        {message}
      </Text>
    </View>
  );
};

export default AIMessage;
