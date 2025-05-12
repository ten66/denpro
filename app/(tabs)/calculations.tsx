import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, ScrollView, ColorValue } from 'react-native';
import { useTheme } from '../_layout';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// カードの型定義
type CalculationCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradientColors: [string, string];
};

export default function CalculationsScreen() {
  const { isDarkMode } = useTheme();
  const [activeCategory, setActiveCategory] = useState<'basic' | 'advanced'>('basic');
  
  // カテゴリ切り替え
  const switchCategory = (category: 'basic' | 'advanced') => {
    if (category === activeCategory) return;
    setActiveCategory(category);
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: isDarkMode ? '#1A1A1A' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#eee',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 16,
    },
    categories: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    categoryButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 10,
    },
    categoryText: {
      fontSize: 15,
      fontWeight: '600',
    },
    activeCategory: {
      backgroundColor: isDarkMode ? '#3b82f6' : '#0070f3',
    },
    inactiveCategory: {
      backgroundColor: isDarkMode ? '#333' : '#eee',
    },
    activeCategoryText: {
      color: '#fff',
    },
    inactiveCategoryText: {
      color: isDarkMode ? '#bbb' : '#666',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#ddd' : '#333',
      marginBottom: 12,
      marginLeft: 4,
    },
    card: {
      backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    },
    cardGradient: {
      borderRadius: 12,
    },
    cardContent: {
      padding: 16,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardIconBasic: {
      backgroundColor: isDarkMode ? '#1a4971' : '#e6f2ff',
    },
    cardIconAdvanced: {
      backgroundColor: isDarkMode ? '#71351a' : '#fff0e6',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: isDarkMode ? '#fff' : '#000',
    },
    cardDescription: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#666',
      marginBottom: 12,
      lineHeight: 20,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    linkText: {
      fontSize: 14,
      fontWeight: 'bold',
      marginRight: 4,
    },
    basicLinkText: {
      color: isDarkMode ? '#4dabf7' : '#0070f3',
    },
    advancedLinkText: {
      color: isDarkMode ? '#f7ad4d' : '#f37000',
    },
    noContent: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noContentText: {
      fontSize: 16,
      color: isDarkMode ? '#999' : '#666',
      textAlign: 'center',
    },
  });

  // 基本計算カードの定義
  const basicCalculations: CalculationCard[] = [
    {
      id: 'voltage-drop',
      title: '電圧降下',
      description: '電線の長さ、電流、電線の断面積に基づいて電圧降下を計算します。',
      icon: 'flash-outline',
      gradientColors: isDarkMode ? ['#1a365d', '#2a4365'] : ['#ebf8ff', '#bee3f8'],
    },
    {
      id: 'wire-size',
      title: '電線断面積',
      description: '電線の長さ、電流、電圧降下に基づいて必要な電線断面積を計算します。',
      icon: 'resize-outline',
      gradientColors: isDarkMode ? ['#1e3a5f', '#2d4d7a'] : ['#e6f6ff', '#bae6fd'],
    },
  ];

  // 応用計算カードの定義
  const advancedCalculations: CalculationCard[] = [
    {
      id: 'voltage-drop-rate',
      title: '電圧降下率',
      description: '電線の長さ、電流、電線の断面積、電圧に基づいて電圧降下率を計算します。',
      icon: 'trending-down-outline',
      gradientColors: isDarkMode ? ['#5d1a1a', '#652a2a'] : ['#fff5f5', '#fed7d7'],
    },
  ];

  // アクティブなカテゴリのカードを表示
  const renderCards = () => {
    const cards = activeCategory === 'basic' ? basicCalculations : advancedCalculations;
    
    if (cards.length === 0) {
      return (
        <View style={styles.noContent}>
          <Text style={styles.noContentText}>このカテゴリには計算ツールがまだありません</Text>
        </View>
      );
    }
    
    return cards.map((card) => (
      <Link key={card.id} href={`/calculations/${card.id}` as any} asChild>
        <TouchableOpacity style={styles.card}>
          <LinearGradient
            colors={card.gradientColors}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.cardContent}>
              <View 
                style={[
                  styles.cardIcon, 
                  activeCategory === 'basic' ? styles.cardIconBasic : styles.cardIconAdvanced
                ]}
              >
                <Ionicons 
                  name={card.icon as any} 
                  size={24} 
                  color={activeCategory === 'basic' 
                    ? (isDarkMode ? '#4dabf7' : '#0070f3') 
                    : (isDarkMode ? '#f7ad4d' : '#f37000')
                  } 
                />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>
                {card.description}
              </Text>
              <View style={styles.linkRow}>
                <Text 
                  style={[
                    styles.linkText, 
                    activeCategory === 'basic' ? styles.basicLinkText : styles.advancedLinkText
                  ]}
                >
                  計算する
                </Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={16} 
                  color={activeCategory === 'basic' 
                    ? (isDarkMode ? '#4dabf7' : '#0070f3') 
                    : (isDarkMode ? '#f7ad4d' : '#f37000')
                  } 
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Link>
    ));
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー部分 */}
      <View style={styles.header}>
        <Text style={styles.title}>計算ツール</Text>
        
        {/* カテゴリ切り替えボタン */}
        <View style={styles.categories}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              activeCategory === 'basic' ? styles.activeCategory : styles.inactiveCategory
            ]}
            onPress={() => switchCategory('basic')}
          >
            <Text 
              style={[
                styles.categoryText,
                activeCategory === 'basic' ? styles.activeCategoryText : styles.inactiveCategoryText
              ]}
            >
              基本計算
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.categoryButton,
              activeCategory === 'advanced' ? styles.activeCategory : styles.inactiveCategory
            ]}
            onPress={() => switchCategory('advanced')}
          >
            <Text 
              style={[
                styles.categoryText,
                activeCategory === 'advanced' ? styles.activeCategoryText : styles.inactiveCategoryText
              ]}
            >
              応用計算
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* カード表示エリア */}
      <ScrollView style={styles.content}>
        <View>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'basic' ? '基本的な電気計算' : '応用的な電気計算'}
          </Text>
          {renderCards()}
        </View>
      </ScrollView>
    </View>
  );
} 