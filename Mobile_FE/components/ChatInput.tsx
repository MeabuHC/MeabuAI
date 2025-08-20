import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import MicroIcon from "../assets/svg/micro.svg";
import MusicIcon from "../assets/svg/music.svg";
import PlusIcon from "../assets/svg/plus.svg";

import { ChatInputProps } from "../types/components";

const ChatInput: React.FC<ChatInputProps> = ({
  text,
  onTextChange,
  onSend,
  onAddPress,
}) => {
  const [isWrapped, setIsWrapped] = useState(false);

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    setIsWrapped(height > 50);
  };

  return (
    <View className="bg-white px-4 rounded-t-3xl mt-auto pb-5 flex-row items-center space-x-3 pt-4">
      <TouchableOpacity
        className="bg-[#F3F3F3] rounded-full p-[9px] mr-3 mt-auto mb-2"
        onPress={onAddPress}
      >
        <PlusIcon width={22} height={22} />
      </TouchableOpacity>

      <View
        className={`flex-1 bg-[#F3F3F3] flex-row items-center ${
          isWrapped ? "rounded-[20px]" : "rounded-full"
        }`}
      >
        <TextInput
          placeholder="Ask anything"
          className="flex-1 text-xl py-4 px-5 font-normal"
          value={text}
          onChangeText={onTextChange}
          multiline={true}
          style={{
            textAlignVertical: "center",
            maxHeight: 150,
          }}
          onContentSizeChange={handleContentSizeChange}
        />
        {!text.trim() && (
          <TouchableOpacity
            className="p-2 mr-2 mt-auto mb-2"
            activeOpacity={0.5}
            onPress={() => {}}
          >
            <MicroIcon width={25} height={25} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="bg-[#000000] rounded-full p-2 mr-2 mt-auto mb-2"
          activeOpacity={0.5}
          onPress={text.trim() ? onSend : undefined}
        >
          {text.trim() ? (
            <Ionicons name="arrow-up" size={25} color="#FFFFFF" />
          ) : (
            <MusicIcon width={25} height={25} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInput;
