import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAppSelector } from "../store/hooks";

const LoadingScreen: React.FC = () => {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <View
      className={`flex-1 justify-center items-center ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
    >
      <ActivityIndicator size="large" color={isDark ? "white" : "purple"} />
      <Text
        className={`mt-4 text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
      >
        Loading...
      </Text>
    </View>
  );
};

export default LoadingScreen;
