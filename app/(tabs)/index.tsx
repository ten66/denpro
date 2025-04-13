import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';

// 資料データの型定義
type Material = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

// 電気工事士関連の資料データ
const electricianMaterials: Material[] = [
  {
    id: '1',
    title: '電線管サイズ表',
    description: '各種電線管の規格とケーブル収容本数',
    icon: 'git-branch',
    route: '/materials/conduit',
  },
  {
    id: '2',
    title: '許容電流/IV',
    description: 'IV線の許容電流',
    icon: 'flash',
    route: '/materials/ampacityIV',
  },
];

export default function MaterialsScreen() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [materials] = useState(electricianMaterials);
  const [scrollY] = useState(new Animated.Value(0));

  // アニメーション値
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 70],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const renderItem = ({ item }: { item: Material }) => {
    const scaleAnim = new Animated.Value(1);
    
    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };
    
    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Link href={item.route as any} asChild>
        <TouchableOpacity
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={item.icon} 
                size={28} 
                color={isDarkMode ? '#4FC3F7' : '#2196F3'} 
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {item.title}
              </Text>
              <Text style={[styles.description, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                {item.description}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? '#777777' : '#CCCCCC'} 
            />
          </Animated.View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F2F2F7' }]}>
      <Animated.View 
        style={[
          styles.header, 
          { 
            height: headerHeight,
            backgroundColor: isDarkMode ? '#121212' : '#F2F2F7',
          }
        ]}
      >
        <Animated.Text 
          style={[
            styles.headerTitle, 
            { 
              opacity: headerOpacity,
              color: isDarkMode ? '#FFFFFF' : '#000000',
            }
          ]}
        >
          電気工事士資料
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.headerSubtitle, 
            { 
              opacity: headerOpacity,
              color: isDarkMode ? '#AAAAAA' : '#666666',
            }
          ]}
        >
          工事に役立つ資料を探す
        </Animated.Text>
      </Animated.View>

      <FlatList
        data={materials}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
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
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
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
