import { registerRootComponent } from "expo";
import "react-native-gesture-handler";
import "react-native-get-random-values";

// Suppress SafeAreaView deprecation warning
import { LogBox } from "react-native";

// Polyfills for streaming support
import { polyfill as polyfillFetch } from "react-native-polyfill-globals/src/fetch";
import { TextDecoder, TextEncoder } from "text-encoding";
import { ReadableStream } from "web-streams-polyfill";

import App from "./App";
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

// Apply polyfills
polyfillFetch();

// Manual ReadableStream polyfill
global.ReadableStream = global.ReadableStream || ReadableStream;

// Make TextDecoder and TextEncoder globally available
global.TextDecoder = global.TextDecoder || TextDecoder;
global.TextEncoder = global.TextEncoder || TextEncoder;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
