import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from 'react-native';
import { createContext, useState, useContext } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

/** テーマコンテキストの作成 */
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

/** テーマコンテキスト */
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

/** テーマコンテキストを使用する */
export const useTheme = () => useContext(ThemeContext);

/** ルートレイアウト */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  /** テーマを切り替える */
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name='+not-found' />
        </Stack>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
