import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import "./global.css";
import { store } from "./store";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { restoreAuthState } from "./store/slices/authSlice";

import LoadingScreen from "./components/LoadingScreen";
import DrawerNavigator from "./navigation/DrawerNavigator";
import LoginScreen from "./screens/LoginScreen";
import { RootStackParamList } from "./types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Main navigation component
function MainNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.theme);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Load your custom fonts here
        await Font.loadAsync({
          SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
          // Add more fonts here as needed
          // 'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn("Error loading fonts:", error);
        setFontsLoaded(true); // Continue even if font loading fails
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    loadFonts();
    dispatch(restoreAuthState());
  }, [dispatch]);

  // Show loading screen while checking authentication state or loading fonts
  if (isLoading || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {isAuthenticated ? (
            <Stack.Screen name="Drawer" component={DrawerNavigator} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <MainNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
