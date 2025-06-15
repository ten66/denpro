import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { createContext, useState, useContext, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const THEME_STORAGE_KEY = '@denpro_theme_preference';

/** ルートレイアウト */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  /** アプリ起動時に保存されたテーマ設定を読み込み */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.warn('テーマ設定の読み込みに失敗しました:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadTheme();
  }, []);

  /** テーマを切り替える */
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.warn('テーマ設定の保存に失敗しました:', error);
    }
  };

  // テーマが読み込まれるまで何も表示しない（ちらつき防止）
  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
