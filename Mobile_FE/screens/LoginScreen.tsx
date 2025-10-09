import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import GoogleSvg from "../assets/svg/google.svg";
import AnimatedHeadline from "../components/AnimatedHeadline";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearError, loginUser, registerUser } from "../store/slices/authSlice";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((s) => s.auth.isLoading);
  const authError = useAppSelector((s) => s.auth.error);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSignup, setIsSignup] = React.useState(false);
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [confirmFocused, setConfirmFocused] = React.useState(false);
  const handleContinueWithGoogle = () => {
    // TODO: integrate Google sign-in
  };

  const handleSignUp = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFormError(null);
    dispatch(clearError());
    setIsSignup(true);
  };

  const handleLogin = () => {
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    setFormError(null);
    dispatch(loginUser({ email: email.trim(), password }));
  };

  const handleRegister = () => {
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    setFormError(null);
    dispatch(registerUser({ email: email.trim(), password }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        {/* Center headline with animation */}
        <AnimatedHeadline />

        {/* Bottom actions (edge-to-edge with internal padding) */}
        <View>
          <View
            className="bg-black rounded-t-3xl p-4"
            style={{
              paddingBottom: insets.bottom + 12,
              paddingHorizontal: 16,
              paddingTop: 24,
            }}
          >
            {/* Email/Password form */}
            <View className="mb-4">
              <Text className="text-white text-base mb-1">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                className="rounded-xl px-4 py-3 text-white"
                style={{
                  backgroundColor: "#111827",
                  borderWidth: 1,
                  borderColor: emailFocused ? "#6B7280" : "#2B2F36",
                  textAlignVertical: "center",
                  shadowColor: emailFocused ? "#000" : undefined,
                  shadowOpacity: emailFocused ? 0.2 : 0,
                  shadowRadius: emailFocused ? 6 : 0,
                  shadowOffset: emailFocused
                    ? { width: 0, height: 2 }
                    : undefined,
                  elevation: emailFocused ? 2 : 0,
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
            <View className="mb-3">
              <Text className="text-white text-base mb-1">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="none"
                autoComplete="off"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                className="rounded-xl px-4 py-3 text-white"
                style={{
                  backgroundColor: "#111827",
                  borderWidth: 1,
                  borderColor: passwordFocused ? "#6B7280" : "#2B2F36",
                  textAlignVertical: "center",
                  shadowColor: passwordFocused ? "#000" : undefined,
                  shadowOpacity: passwordFocused ? 0.2 : 0,
                  shadowRadius: passwordFocused ? 6 : 0,
                  shadowOffset: passwordFocused
                    ? { width: 0, height: 2 }
                    : undefined,
                  elevation: passwordFocused ? 2 : 0,
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>
            {isSignup && (
              <View className="mb-3">
                <Text className="text-white text-base mb-1">
                  Re-enter password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textContentType="none"
                  autoComplete="off"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  className="rounded-xl px-4 py-3 text-white"
                  style={{
                    backgroundColor: "#111827",
                    borderWidth: 1,
                    borderColor: confirmFocused ? "#6B7280" : "#2B2F36",
                    textAlignVertical: "center",
                    shadowColor: confirmFocused ? "#000" : undefined,
                    shadowOpacity: confirmFocused ? 0.2 : 0,
                    shadowRadius: confirmFocused ? 6 : 0,
                    shadowOffset: confirmFocused
                      ? { width: 0, height: 2 }
                      : undefined,
                    elevation: confirmFocused ? 2 : 0,
                  }}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                />
              </View>
            )}
            {(formError || authError) && (
              <Text className="text-red-400 mb-3">
                {formError ?? authError}
              </Text>
            )}

            {/* Submit button */}
            <TouchableOpacity
              onPress={isSignup ? handleRegister : handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              className="w-full rounded-2xl bg-neutral-800 py-4 items-center mb-4"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  {isSignup ? "Sign up" : "Log in"}
                </Text>
              )}
            </TouchableOpacity>

            {isSignup ? (
              <TouchableOpacity
                onPress={() => {
                  setPassword("");
                  setConfirmPassword("");
                  setFormError(null);
                  dispatch(clearError());
                  setIsSignup(false);
                }}
                activeOpacity={0.8}
                className="w-full rounded-2xl bg-neutral-800 py-4 items-center mb-3"
              >
                <Text className="text-white text-lg font-semibold">
                  Go back
                </Text>
              </TouchableOpacity>
            ) : null}

            {!isSignup && (
              <>
                {/* Divider */}
                <View className="flex-row items-center mb-3">
                  <View
                    style={{ flex: 1, height: 1, backgroundColor: "#374151" }}
                  />
                  <Text className="text-gray-400 mx-3">or</Text>
                  <View
                    style={{ flex: 1, height: 1, backgroundColor: "#374151" }}
                  />
                </View>
                {/* Continue with Google (no Apple) */}
                <TouchableOpacity
                  onPress={handleContinueWithGoogle}
                  activeOpacity={0.8}
                  className="w-full rounded-2xl bg-neutral-800 py-4 items-center mb-3"
                >
                  <View className="flex-row items-center justify-center">
                    <GoogleSvg
                      width={20}
                      height={20}
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white text-lg font-semibold">
                      Continue with Google
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Sign up */}
            {!isSignup && (
              <TouchableOpacity
                onPress={handleSignUp}
                activeOpacity={0.8}
                className="w-full rounded-2xl bg-neutral-800 py-4 items-center mb-3"
              >
                <Text className="text-white text-lg font-semibold">
                  Sign up
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
