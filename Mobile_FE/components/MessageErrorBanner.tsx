import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ErrorType = "network" | "timeout" | "server" | "unknown";

type Props = {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
};

const defaultTextForType: Record<ErrorType, string> = {
  network: "The Internet connection appears to be offline.",
  timeout: "The request took too long. Please try again.",
  server: "The server encountered an error. Please try again.",
  unknown: "Something went wrong. Please try again.",
};

const MessageErrorBanner: React.FC<Props> = ({
  type = "unknown",
  message,
  onRetry,
}) => {
  const text = message || defaultTextForType[type];
  return (
    <View
      className="mx-4 mt-2 mb-2 rounded-2xl"
      style={{
        backgroundColor: "#FFF4ED",
        borderWidth: 1,
        borderColor: "#FDE1D2",
      }}
    >
      <View className="px-4 py-3">
        <Text className="text-base" style={{ color: "#B45309" }}>
          {text}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.8}
            className="mt-3 rounded-xl items-center"
            style={{ backgroundColor: "#F97316", paddingVertical: 10 }}
          >
            <Text className="text-white text-base font-semibold">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MessageErrorBanner;
