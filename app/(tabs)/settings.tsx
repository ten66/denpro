import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';

type SettingItem = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  type: 'toggle' | 'link';
  value?: boolean;
  onPress?: () => void;
};

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [animation] = useState(new Animated.Value(0));

  // テーマ変更時のアニメーション
  const handleThemeToggle = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    toggleTheme();
  };

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1]
  });

  // 設定項目
  const settings: SettingItem[] = [
    {
      id: 'appearance',
      title: 'ダークモード',
      description: '画面の表示テーマを切り替えます',
      icon: isDarkMode ? 'moon' : 'sunny',
      iconColor: isDarkMode ? '#9C8FFF' : '#FFB74D',
      type: 'toggle',
      value: isDarkMode,
      onPress: handleThemeToggle,
    },
    {
      id: 'notifications',
      title: '通知',
      description: 'プッシュ通知の設定',
      icon: 'notifications',
      iconColor: '#F06292',
      type: 'link',
    },
    {
      id: 'account',
      title: 'アカウント',
      description: 'アカウント情報の管理',
      icon: 'person-circle',
      iconColor: '#4FC3F7',
      type: 'link',
    },
    {
      id: 'storage',
      title: 'ストレージ',
      description: 'ダウンロードと保存の設定',
      icon: 'cloud-download',
      iconColor: '#81C784',
      type: 'link',
    },
    {
      id: 'about',
      title: 'アプリについて',
      description: 'バージョン情報とライセンス',
      icon: 'information-circle',
      iconColor: '#7986CB',
      type: 'link',
    },
  ];

  const renderItem = (item: SettingItem) => {
    const isAppearanceItem = item.id === 'appearance';
    const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${item.iconColor}20` }
        ]}>
          {isAppearanceItem ? (
            <AnimatedIcon
              name={item.icon}
              size={24}
              color={item.iconColor}
              style={{
                transform: [
                  { rotate },
                  { scale }
                ]
              }}
            />
          ) : (
            <Ionicons name={item.icon} size={24} color={item.iconColor} />
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={[
            styles.title,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {item.title}
          </Text>
          <Text style={[
            styles.description,
            { color: isDarkMode ? '#AAAAAA' : '#666666' }
          ]}>
            {item.description}
          </Text>
        </View>
        
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: '#767577', true: '#4FC3F7' }}
            thumbColor={item.value ? '#2196F3' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDarkMode ? '#777777' : '#CCCCCC'}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#121212' : '#F2F2F7' }
    ]}>
      <View style={styles.header}>
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          設定
        </Text>
        <Text style={[
          styles.headerSubtitle,
          { color: isDarkMode ? '#AAAAAA' : '#666666' }
        ]}>
          アプリの設定を変更
        </Text>
      </View>

      <View style={styles.settingsContainer}>
        {settings.map(renderItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  settingsContainer: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
}); 