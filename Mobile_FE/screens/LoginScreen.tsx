import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearError, loginUser } from "../store/slices/authSlice";
import type { LoginCredentials } from "../types/auth";
import type { RootStackParamList } from "../types/navigation";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    dispatch(clearError());

    try {
      await dispatch(loginUser(credentials)).unwrap();
      Alert.alert("Success", "Login successful!");
    } catch (error) {
      Alert.alert("Login Error", error as string);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} login will be implemented soon!`);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="mb-8">
              <View className="flex-row justify-center items-baseline mb-2">
                <Text
                  className={`text-4xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Welcome to{" "}
                </Text>
                <Text className="text-4xl font-bold text-purple-600">
                  MeabuAI
                </Text>
              </View>
              <Text
                className={`text-lg text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sign in to your account
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                <Text className="text-red-700 text-center">{error}</Text>
              </View>
            )}

            {/* Login Form */}
            <View className="space-y-4 mb-6 gap-3">
              {/* Email Input */}
              <View>
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email Address
                </Text>
                <TextInput
                  className={`w-full px-4 border rounded-lg text-base ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  }`}
                  style={{ height: 50, textAlignVertical: "center" }}
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChangeText={(text) =>
                    setCredentials({ ...credentials, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  importantForAutofill="yes"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    // Focus password field when user taps next
                  }}
                />
              </View>

              {/* Password Input */}
              <View>
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className={`w-full px-4 pr-12 border rounded-lg text-base ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    }`}
                    style={{ height: 50, textAlignVertical: "center" }}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChangeText={(text) =>
                      setCredentials({ ...credentials, password: text })
                    }
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                    textContentType="password"
                    importantForAutofill="yes"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-0 bottom-0 justify-center items-center"
                    style={{ width: 24, height: 50 }}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        className={`text-lg ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`w-full py-4 rounded-lg mb-6 ${
                isLoading ? "bg-gray-400" : "bg-purple-600 active:bg-purple-700"
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-lg font-semibold text-center">
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View
                className={`flex-1 h-px ${
                  isDark ? "bg-gray-600" : "bg-gray-300"
                }`}
              />
              <Text
                className={`mx-4 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Or continue with
              </Text>
              <View
                className={`flex-1 h-px ${
                  isDark ? "bg-gray-600" : "bg-gray-300"
                }`}
              />
            </View>

            {/* Social Login Buttons */}
            <View className="space-y-3 mb-6 gap-3">
              {/* Google Login */}
              <TouchableOpacity
                className={`w-full py-3 border rounded-lg flex-row items-center justify-center ${
                  isDark
                    ? "border-gray-600 bg-gray-800"
                    : "border-gray-300 bg-white"
                }`}
                onPress={() => handleSocialLogin("Google")}
              >
                <Text className="text-2xl mr-3">🟦</Text>
                <Text
                  className={`text-base font-medium ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Facebook Login */}
              <TouchableOpacity
                className={`w-full py-3 border rounded-lg flex-row items-center justify-center ${
                  isDark
                    ? "border-gray-600 bg-gray-800"
                    : "border-gray-300 bg-white"
                }`}
                onPress={() => handleSocialLogin("Facebook")}
              >
                <Text className="text-2xl mr-3">🔵</Text>
                <Text
                  className={`text-base font-medium ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Continue with Facebook
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="items-center">
              <Text
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Don&apos;t have an account?{" "}
                <Text
                  className="text-purple-600 font-medium"
                  onPress={() =>
                    Alert.alert(
                      "Coming Soon",
                      "Registration will be implemented soon!"
                    )
                  }
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
