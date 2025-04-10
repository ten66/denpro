import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';

// 電線管のデータ定義
type ConduitType = {
  id: string;
  name: string;
  description: string;
  sizes: ConduitSize[];
};

type ConduitSize = {
  size: string;
  outerDiameter: string;
  innerDiameter: string;
  maxCables: {
    iv2: number;
    iv5_5: number;
    iv8: number;
    iv14: number;
  };
};

// 電線管データ
const conduitData: ConduitType[] = [
  {
    id: 'pvc',
    name: '硬質塩化ビニル管（PF管）',
    description: '屋内の露出・隠蔽配線に使用される薄肉電線管',
    sizes: [
      {
        size: '16mm',
        outerDiameter: '16mm',
        innerDiameter: '14mm',
        maxCables: { iv2: 9, iv5_5: 5, iv8: 3, iv14: 2 }
      },
      {
        size: '22mm',
        outerDiameter: '22mm',
        innerDiameter: '19mm',
        maxCables: { iv2: 16, iv5_5: 9, iv8: 5, iv14: 3 }
      },
      {
        size: '28mm',
        outerDiameter: '28mm',
        innerDiameter: '25mm',
        maxCables: { iv2: 25, iv5_5: 14, iv8: 9, iv14: 5 }
      },
      {
        size: '36mm',
        outerDiameter: '36mm',
        innerDiameter: '32mm',
        maxCables: { iv2: 36, iv5_5: 20, iv8: 12, iv14: 7 }
      },
      {
        size: '42mm',
        outerDiameter: '42mm',
        innerDiameter: '38mm',
        maxCables: { iv2: 49, iv5_5: 27, iv8: 16, iv14: 9 }
      }
    ]
  },
  {
    id: 'metal',
    name: '金属管（薄鋼電線管）',
    description: '耐火性・耐久性に優れた金属製電線管',
    sizes: [
      {
        size: 'E19',
        outerDiameter: '19mm',
        innerDiameter: '16.5mm',
        maxCables: { iv2: 12, iv5_5: 7, iv8: 4, iv14: 2 }
      },
      {
        size: 'E25',
        outerDiameter: '25mm',
        innerDiameter: '22.5mm',
        maxCables: { iv2: 21, iv5_5: 12, iv8: 7, iv14: 4 }
      },
      {
        size: 'E31',
        outerDiameter: '31mm',
        innerDiameter: '28mm',
        maxCables: { iv2: 32, iv5_5: 18, iv8: 10, iv14: 6 }
      },
      {
        size: 'E39',
        outerDiameter: '39mm',
        innerDiameter: '35.5mm',
        maxCables: { iv2: 51, iv5_5: 28, iv8: 17, iv14: 10 }
      },
      {
        size: 'E51',
        outerDiameter: '51mm',
        innerDiameter: '47mm',
        maxCables: { iv2: 89, iv5_5: 49, iv8: 30, iv14: 17 }
      }
    ]
  },
  {
    id: 'cd',
    name: 'CD管（可とう電線管）',
    description: '柔軟性があり曲げやすい電線管',
    sizes: [
      {
        size: '14mm',
        outerDiameter: '14mm',
        innerDiameter: '10mm',
        maxCables: { iv2: 4, iv5_5: 2, iv8: 1, iv14: 1 }
      },
      {
        size: '16mm',
        outerDiameter: '16mm',
        innerDiameter: '12mm',
        maxCables: { iv2: 6, iv5_5: 3, iv8: 2, iv14: 1 }
      },
      {
        size: '22mm',
        outerDiameter: '22mm',
        innerDiameter: '17mm',
        maxCables: { iv2: 12, iv5_5: 7, iv8: 4, iv14: 2 }
      },
      {
        size: '28mm',
        outerDiameter: '28mm',
        innerDiameter: '23mm',
        maxCables: { iv2: 21, iv5_5: 12, iv8: 7, iv14: 4 }
      },
      {
        size: '36mm',
        outerDiameter: '36mm',
        innerDiameter: '30mm',
        maxCables: { iv2: 36, iv5_5: 20, iv8: 12, iv14: 7 }
      }
    ]
  }
];

export default function ConduitScreen() {
  const { isDarkMode } = useTheme();
  const [selectedConduit, setSelectedConduit] = useState<ConduitType | null>(null);
  const [selectedSize, setSelectedSize] = useState<ConduitSize | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const detailAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 初期アニメーション
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (selectedConduit) {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      cardAnimation.setValue(0);
    }
  }, [selectedConduit]);

  useEffect(() => {
    if (selectedSize) {
      Animated.timing(detailAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      detailAnimation.setValue(0);
    }
  }, [selectedSize]);

  const handleConduitSelect = (conduit: ConduitType) => {
    setSelectedSize(null);
    detailAnimation.setValue(0);
    
    if (selectedConduit?.id === conduit.id) {
      // 同じものを選択した場合は閉じる
      Animated.timing(cardAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setSelectedConduit(null);
      });
    } else {
      // 違うものを選択した場合
      if (selectedConduit) {
        Animated.timing(cardAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setSelectedConduit(conduit);
        });
      } else {
        setSelectedConduit(conduit);
      }
    }
  };

  const handleSizeSelect = (size: ConduitSize) => {
    if (selectedSize?.size === size.size) {
      Animated.timing(detailAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setSelectedSize(null);
      });
    } else {
      setSelectedSize(size);
    }
  };

  const renderConduitCard = ({ item }: { item: ConduitType }) => {
    const isSelected = selectedConduit?.id === item.id;
    const cardScale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleConduitSelect(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={[
            styles.conduitCard,
            {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
              borderColor: isSelected 
                ? isDarkMode ? '#4FC3F7' : '#2196F3' 
                : isDarkMode ? '#2A2A2A' : '#E0E0E0',
              transform: [{ scale: cardScale }]
            }
          ]}
        >
          <View style={styles.conduitHeader}>
            <View style={[styles.iconContainer, { backgroundColor: isSelected ? '#2196F380' : '#2196F320' }]}>
              <Ionicons 
                name={item.id === 'pvc' ? 'ellipse' : item.id === 'metal' ? 'hardware-chip' : 'git-branch'} 
                size={24} 
                color={isDarkMode ? '#4FC3F7' : '#2196F3'} 
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.conduitTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {item.name}
              </Text>
              <Text style={[styles.conduitDescription, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                {item.description}
              </Text>
            </View>
            <Ionicons 
              name={isSelected ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isDarkMode ? '#AAAAAA' : '#666666'} 
            />
          </View>
          
          {isSelected && (
            <Animated.View 
              style={[
                styles.sizesContainer,
                {
                  opacity: cardAnimation,
                  transform: [{ translateY: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })}]
                }
              ]}
            >
              <Text style={[styles.sizesTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                規格サイズ一覧
              </Text>
              <View style={styles.sizeButtonsContainer}>
                {item.sizes.map((size) => (
                  <TouchableOpacity
                    key={size.size}
                    style={[
                      styles.sizeButton,
                      {
                        backgroundColor: selectedSize?.size === size.size 
                          ? isDarkMode ? '#4FC3F7' : '#2196F3'
                          : isDarkMode ? '#2A2A2A' : '#F0F0F0'
                      }
                    ]}
                    onPress={() => handleSizeSelect(size)}
                  >
                    <Text 
                      style={[
                        styles.sizeButtonText, 
                        { 
                          color: selectedSize?.size === size.size 
                            ? '#FFFFFF' 
                            : isDarkMode ? '#FFFFFF' : '#000000' 
                        }
                      ]}
                    >
                      {size.size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedSize && (
                <Animated.View 
                  style={[
                    styles.sizeDetailContainer,
                    {
                      opacity: detailAnimation,
                      transform: [{ translateY: detailAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })}]
                    }
                  ]}
                >
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                      外径:
                    </Text>
                    <Text style={[styles.detailValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                      {selectedSize.outerDiameter}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                      内径:
                    </Text>
                    <Text style={[styles.detailValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                      {selectedSize.innerDiameter}
                    </Text>
                  </View>
                  
                  <Text style={[styles.cableCountTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    収容可能電線数（IV線）
                  </Text>
                  
                  <View style={styles.cableCountContainer}>
                    <View style={[styles.cableItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                      <Text style={[styles.cableType, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                        2.0mm²
                      </Text>
                      <Text style={[styles.cableCount, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                        {selectedSize.maxCables.iv2}本
                      </Text>
                    </View>
                    <View style={[styles.cableItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                      <Text style={[styles.cableType, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                        5.5mm²
                      </Text>
                      <Text style={[styles.cableCount, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                        {selectedSize.maxCables.iv5_5}本
                      </Text>
                    </View>
                    <View style={[styles.cableItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                      <Text style={[styles.cableType, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                        8.0mm²
                      </Text>
                      <Text style={[styles.cableCount, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                        {selectedSize.maxCables.iv8}本
                      </Text>
                    </View>
                    <View style={[styles.cableItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                      <Text style={[styles.cableType, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                        14.0mm²
                      </Text>
                      <Text style={[styles.cableCount, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                        {selectedSize.maxCables.iv14}本
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F2F2F7' }]}>
      <Stack.Screen
        options={{
          title: '電線管サイズ表',
          headerStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
          },
          headerTintColor: isDarkMode ? '#FFFFFF' : '#000000',
        }}
      />
      
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: isDarkMode ? '#121212' : '#F2F2F7',
            opacity: animatedValue,
            transform: [{ 
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })
            }]
          }
        ]}
      >
        <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          電線管サイズガイド
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
          種類と規格に応じたサイズと収容可能電線数
        </Text>
      </Animated.View>
      
      <FlatList
        data={conduitData}
        renderItem={renderConduitCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  listContainer: {
    padding: 12,
  },
  conduitCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  conduitHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  conduitTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  conduitDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  sizesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  sizesTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sizeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sizeDetailContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  cableCountTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  cableCountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cableItem: {
    width: '48%',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  cableType: {
    fontSize: 13,
    marginBottom: 4,
  },
  cableCount: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});