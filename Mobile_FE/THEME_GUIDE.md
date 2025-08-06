# Theme Management Guide

This project includes a Redux slice for managing app themes with support for light, dark, and system themes.

## 🎨 Theme Slice Features

### Theme Types

- **Light**: Always use light theme
- **Dark**: Always use dark theme
- **System**: Follow system theme preference

### State Structure

```typescript
interface ThemeState {
  theme: Theme; // User's selected theme preference
  systemTheme: "light" | "dark"; // Current system theme
  effectiveTheme: "light" | "dark"; // Actual theme being used
}
```

## 🚀 Usage

### Using Theme in Components

```typescript
import { useAppSelector } from "../store/hooks";

export default function MyComponent() {
  const { theme, effectiveTheme } = useAppSelector((state) => state.theme);
  const isDark = effectiveTheme === "dark";

  return (
    <View className={`p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
      <Text className={`${isDark ? "text-white" : "text-gray-800"}`}>
        Current theme: {theme}
      </Text>
    </View>
  );
}
```

### Changing Themes

```typescript
import { useAppDispatch } from "../store/hooks";
import { setTheme, toggleTheme } from "../store/slices/themeSlice";

export default function ThemeControls() {
  const dispatch = useAppDispatch();

  return (
    <View>
      <TouchableOpacity onPress={() => dispatch(setTheme("light"))}>
        <Text>Light Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch(setTheme("dark"))}>
        <Text>Dark Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch(setTheme("system"))}>
        <Text>System Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch(toggleTheme())}>
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🎯 Available Actions

### `setTheme(theme: Theme)`

Sets the user's theme preference and updates the effective theme.

### `setSystemTheme(systemTheme: 'light' | 'dark')`

Updates the system theme (useful for responding to system theme changes).

### `toggleTheme()`

Cycles through themes:

- Light → Dark
- Dark → Light
- System → Opposite of current effective theme

## 🔧 Common Patterns

### Conditional Styling

```typescript
const isDark = effectiveTheme === "dark";

<View className={`${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
  <Text className={`${isDark ? "text-white" : "text-gray-800"}`}>
    Hello World
  </Text>
</View>;
```

### Theme-based Component Variants

```typescript
const getButtonStyles = (isDark: boolean) => ({
  primary: isDark ? "bg-blue-600" : "bg-blue-500",
  secondary: isDark ? "bg-gray-700" : "bg-gray-200",
  text: isDark ? "text-white" : "text-gray-800",
});
```

## 🎨 Tailwind CSS Classes for Theming

### Background Colors

- Light: `bg-white`, `bg-gray-100`, `bg-gray-200`
- Dark: `bg-gray-800`, `bg-gray-900`, `bg-gray-700`

### Text Colors

- Light: `text-gray-800`, `text-gray-700`, `text-gray-600`
- Dark: `text-white`, `text-gray-300`, `text-gray-400`

### Border Colors

- Light: `border-gray-300`, `border-gray-200`
- Dark: `border-gray-600`, `border-gray-700`

Happy theming! 🎉
