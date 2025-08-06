import React from "react";
import { Text, View } from "react-native";

interface UserMessageProps {
  message: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <View className="flex-row items-center bg-[#F3F3F3] ml-auto py-3 px-5 rounded-2xl max-w-[70%] mr-4 mb-4">
      <Text className="text-[18px] leading-[30px]" selectable={true}>
        {message}
      </Text>
    </View>
  );
};

export default UserMessage;
