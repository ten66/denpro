import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '../_layout'; // 親コンポーネントから提供されるThemeContextを使用

export default function TabLayout() {
  const { isDarkMode } = useTheme(); // 親コンテキストから取得

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? '#fff' : '#007AFF',
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#8E8E93',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#fff',
        },
        headerStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#fff',
        },
        headerTintColor: isDarkMode ? '#fff' : '#000',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "資料一覧",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculations"
        options={{
          title: "計算",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
