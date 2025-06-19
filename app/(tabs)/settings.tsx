import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Linking,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';
import { router } from 'expo-router';

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

type SettingCategory = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  items: SettingItem[];
};

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [animation] = useState(new Animated.Value(0));
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

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
      }),
    ]).start();

    toggleTheme();
  };

  // URLを開くハンドラ
  const handleOpenURL = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('エラー', 'リンクを開けませんでした');
      }
    });
  };

  // レビュー評価ハンドラ
  const handleRatingPress = () => {
    setShowRatingModal(true);
  };

  // 評価送信ハンドラ
  const handleRatingSubmit = () => {
    setShowRatingModal(false);

    if (selectedRating >= 4) {
      // 4星以上の場合はApp Storeレビューへ
      Alert.alert(
        'レビューをお願いします',
        'このアプリを気に入っていただけたようで嬉しいです！App Storeでレビューを書いていただけませんか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'レビューを書く',
            onPress: () =>
              handleOpenURL(
                'https://itunes.apple.com/jp/app/id6746265873?mt=8&action=write-review',
              ),
          },
        ],
      );
    } else {
      // 3星以下の場合はお問い合わせへ
      Alert.alert(
        'フィードバックをお聞かせください',
        'アプリを改善するため、お問い合わせフォームからご意見をお聞かせください。',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'お問い合わせ',
            onPress: () => handleOpenURL('https://forms.gle/chswttw68dP9XPuR7'),
          },
        ],
      );
    }

    setSelectedRating(0);
  };

  // 評価モーダルを閉じる
  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setSelectedRating(0);
  };

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  // 設定カテゴリ
  const settingCategories: SettingCategory[] = [
    {
      id: 'appearance',
      title: '外観',
      icon: 'color-palette',
      iconColor: '#FF9800',
      items: [
        {
          id: 'darkMode',
          title: 'ダークモード',
          description: '画面の表示テーマを切り替えます',
          icon: isDarkMode ? 'moon' : 'sunny',
          iconColor: isDarkMode ? '#9C8FFF' : '#FFB74D',
          type: 'toggle',
          value: isDarkMode,
          onPress: handleThemeToggle,
        },
      ],
    },
    {
      id: 'review',
      title: 'アプリの評価',
      icon: 'star',
      iconColor: '#FFD700',
      items: [
        {
          id: 'rate-app',
          title: 'アプリを評価',
          description: 'このアプリの評価をお聞かせください',
          icon: 'star-outline',
          iconColor: '#FFD700',
          type: 'link',
          onPress: handleRatingPress,
        },
      ],
    },
    {
      id: 'support',
      title: 'サポート・情報',
      icon: 'help-buoy',
      iconColor: '#2196F3',
      items: [
        {
          id: 'contact',
          title: 'お問い合わせ',
          description: 'バグ報告や機能リクエスト',
          icon: 'mail',
          iconColor: '#2196F3',
          type: 'link',
          onPress: () => handleOpenURL('https://forms.gle/chswttw68dP9XPuR7'),
        },
      ],
    },
    {
      id: 'legal',
      title: '法的情報',
      icon: 'shield',
      iconColor: '#4CAF50',
      items: [
        {
          id: 'privacy',
          title: 'プライバシーポリシー',
          description: '個人情報の取り扱いについて',
          icon: 'lock-closed',
          iconColor: '#4CAF50',
          type: 'link',
          onPress: () => handleOpenURL('https://sites.google.com/view/denpro-privacy/'),
        },
        {
          id: 'terms',
          title: '利用規約',
          description: 'アプリ利用に関する規約',
          icon: 'document-text',
          iconColor: '#9C27B0',
          type: 'link',
          onPress: () => handleOpenURL('https://sites.google.com/view/denpro-terms/'),
        },
        {
          id: 'disclaimer',
          title: '免責事項',
          description: 'アプリ利用に関する免責事項',
          icon: 'shield-checkmark',
          iconColor: '#FF9800',
          type: 'link',
          onPress: () => router.push('/settings/disclaimer'),
        },
      ],
    },
  ];

  const renderItem = (item: SettingItem, index: number, totalItems: number) => {
    const isAppearanceItem = item.id === 'darkMode';
    const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
    const isLastItem = index === totalItems - 1;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          {
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderBottomWidth: isLastItem ? 0 : 0.5,
            borderBottomColor: isDarkMode ? '#333333' : '#EEEEEE',
          },
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}20` }]}>
          {isAppearanceItem ? (
            <AnimatedIcon
              name={item.icon}
              size={24}
              color={item.iconColor}
              style={{
                transform: [{ rotate }, { scale }],
              }}
            />
          ) : (
            <Ionicons name={item.icon} size={24} color={item.iconColor} />
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
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
          <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#777777' : '#CCCCCC'} />
        )}
      </TouchableOpacity>
    );
  };

  const renderCategory = (category: SettingCategory) => {
    return (
      <View key={category.id} style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <View
            style={[styles.categoryIconContainer, { backgroundColor: `${category.iconColor}20` }]}>
            <Ionicons name={category.icon} size={20} color={category.iconColor} />
          </View>
          <Text style={[styles.categoryTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {category.title}
          </Text>
        </View>

        <View
          style={[
            styles.categoryItems,
            {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            },
          ]}>
          {category.items.map((item, index) => renderItem(item, index, category.items.length))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F2F2F7' }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          設定
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
          アプリの設定を変更
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.settingsContainer}>{settingCategories.map(renderCategory)}</View>
      </ScrollView>

      {/* 評価モーダル */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseRatingModal}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' },
            ]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              アプリの評価
            </Text>
            <Text style={[styles.modalDescription, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
              このアプリはいかがでしたか？
            </Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  style={styles.starButton}>
                  <Ionicons
                    name={selectedRating >= star ? 'star' : 'star-outline'}
                    size={40}
                    color={selectedRating >= star ? '#FFD700' : isDarkMode ? '#666666' : '#CCCCCC'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: isDarkMode ? '#333333' : '#CCCCCC' },
                ]}
                onPress={handleCloseRatingModal}>
                <Text
                  style={[styles.cancelButtonText, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                  キャンセル
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  { opacity: selectedRating > 0 ? 1 : 0.5 },
                ]}
                onPress={handleRatingSubmit}
                disabled={selectedRating === 0}>
                <Text style={styles.submitButtonText}>決定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  settingsContainer: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryItems: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  starButton: {
    marginHorizontal: 8,
    padding: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
