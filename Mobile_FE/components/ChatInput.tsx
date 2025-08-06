import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Keyboard,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ChatInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
  onAddPress: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  text,
  onTextChange,
  onSend,
  onAddPress,
}) => {
  const isMultiline = text.includes("\n");

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View className="bg-white px-4 rounded-t-3xl mt-auto pb-5 flex-row items-center space-x-3 pt-4">
        <TouchableOpacity
          className="bg-[#F3F3F3] rounded-full p-2 mr-3 mt-auto mb-2"
          onPress={onAddPress}
        >
          <Ionicons name="add" size={25} color="#000000" />
        </TouchableOpacity>

        <View
          className="flex-1 bg-[#F3F3F3] flex-row items-center"
          style={{
            borderRadius: isMultiline ? 20 : 100,
          }}
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
          />
          <TouchableOpacity
            className="bg-[#000000] rounded-full p-2 mr-2 mt-auto mb-2"
            activeOpacity={0.5}
            onPress={onSend}
          >
            <Ionicons name="arrow-up" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ChatInput;
