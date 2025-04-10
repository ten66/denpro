import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useTheme } from '../_layout';

/** ホーム画面 */
export default function HomeScreen() {
  const { isDarkMode } = useTheme();
  
  // アニメーション用のAnnimated.Value
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // 画面表示時のアニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // カテゴリカード
  const CategoryCard = ({ title, icon, color, route }: 
    { title: string; icon: keyof typeof Ionicons.glyphMap; color: string; route: string }) => {
    return (
      <Link href={route as any} asChild>
        <TouchableOpacity style={[
          styles.categoryCard,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
        ]}>
          <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={28} color={color} />
          </View>
          <Text style={[
            styles.categoryTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {title}
          </Text>
        </TouchableOpacity>
      </Link>
    );
  };

  const FeaturedCard = ({ title, description, bgColor, image }: 
    { title: string; description: string; bgColor: string; image: any }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.featuredCard,
          { backgroundColor: bgColor }
        ]}
      >
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>{title}</Text>
          <Text style={styles.featuredDescription}>{description}</Text>
          <View style={styles.featuredButton}>
            <Text style={styles.featuredButtonText}>詳細を見る</Text>
          </View>
        </View>
        {image && (
          <View style={styles.imageContainer}>
            <Ionicons name={image} size={80} color="rgba(255,255,255,0.8)" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : '#F2F2F7' }
      ]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[
        styles.header,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <Text style={[
          styles.greeting,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          こんにちは
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDarkMode ? '#AAAAAA' : '#666666' }
        ]}>
          電気工事士サポートアプリへようこそ
        </Text>
      </Animated.View>

      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}>
        <FeaturedCard 
          title="第二種電気工事士 筆記試験対策" 
          description="最新の試験情報と学習方法" 
          bgColor="#4361EE"
          image="school"
        />
      </Animated.View>

      <Text style={[
        styles.sectionTitle,
        { color: isDarkMode ? '#FFFFFF' : '#000000' }
      ]}>
        カテゴリー
      </Text>

      <View style={styles.categoriesContainer}>
        <CategoryCard 
          title="資料一覧" 
          icon="document-text" 
          color="#4FC3F7"
          route="/materials"
        />
        <CategoryCard 
          title="実技練習" 
          icon="construct" 
          color="#FF9800"
          route="/practice"
        />
        <CategoryCard 
          title="法令集" 
          icon="book" 
          color="#9C27B0"
          route="/laws"
        />
        <CategoryCard 
          title="設定" 
          icon="settings" 
          color="#4CAF50"
          route="/settings"
        />
      </View>

      <Text style={[
        styles.sectionTitle,
        { color: isDarkMode ? '#FFFFFF' : '#000000' }
      ]}>
        おすすめコンテンツ
      </Text>

      <FeaturedCard 
        title="作業工具の基本" 
        description="電気工事で使う工具の使い方" 
        bgColor="#FF5252"
        image="construct"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuredCard: {
    borderRadius: 16,
    padding: 20,
    height: 180,
    marginVertical: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  featuredContent: {
    width: '60%',
  },
  featuredTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 20,
  },
  featuredButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  imageContainer: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    opacity: 0.8,
  },
});
