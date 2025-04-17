import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';

// 許容電流のデータ定義
type WireSize = {
  size: string;
  insulatorType: string;
  wireType: 'solid' | 'stranded'; // 単線かより線か
  composition?: string; // より線の場合の構成
  isRecommended: boolean; // 一般配線に推奨されるかどうか
  ampacity: {
    outdoor: number;
    indoorCounts: {
      belowThree: number;
      four: number;
      fiveToSix: number;
      sevenToFifteen: number;
      sixteenToForty: number;
      fortyOneToSixty: number;
      aboveSixty: number;
    };
  };
};

type TemperatureCorrection = {
  temp: string;
  factor: number;
};

type WireTypeOption = {
  id: 'solid' | 'stranded';
  name: string;
};

// 温度補正係数
const temperatureCorrections: TemperatureCorrection[] = [
  { temp: '20℃', factor: 1.11 },
  { temp: '25℃', factor: 1.05 },
  { temp: '30℃', factor: 1.00 },
  { temp: '35℃', factor: 0.94 },
  { temp: '40℃', factor: 0.88 },
  { temp: '45℃', factor: 0.82 },
  { temp: '50℃', factor: 0.75 },
];

// 導体形状オプション
const wireTypeOptions: WireTypeOption[] = [
  { id: 'solid', name: '単線' },
  { id: 'stranded', name: 'より線' },
];

// HIV単線の許容電流データ
const solidWireSizes: WireSize[] = [
  {
    size: '1.2mm',
    insulatorType: 'HIV',
    wireType: 'solid',
    isRecommended: false, // 1.2mm以下は一般配線に推奨されない
    ampacity: {
      outdoor: 23,
      indoorCounts: {
        belowThree: 16,
        four: 14,
        fiveToSix: 13,
        sevenToFifteen: 11,
        sixteenToForty: 10,
        fortyOneToSixty: 9,
        aboveSixty: 8,
      }
    }
  },
  {
    size: '1.6mm',
    insulatorType: 'HIV',
    wireType: 'solid',
    isRecommended: true,
    ampacity: {
      outdoor: 33,
      indoorCounts: {
        belowThree: 23,
        four: 20,
        fiveToSix: 18,
        sevenToFifteen: 16,
        sixteenToForty: 14,
        fortyOneToSixty: 13,
        aboveSixty: 11,
      }
    }
  },
  {
    size: '2.0mm',
    insulatorType: 'HIV',
    wireType: 'solid',
    isRecommended: true,
    ampacity: {
      outdoor: 42,
      indoorCounts: {
        belowThree: 29,
        four: 26,
        fiveToSix: 23,
        sevenToFifteen: 20,
        sixteenToForty: 18,
        fortyOneToSixty: 16,
        aboveSixty: 14,
      }
    }
  },
  {
    size: '2.6mm',
    insulatorType: 'HIV',
    wireType: 'solid',
    isRecommended: true,
    ampacity: {
      outdoor: 58,
      indoorCounts: {
        belowThree: 40,
        four: 36,
        fiveToSix: 32,
        sevenToFifteen: 28,
        sixteenToForty: 25,
        fortyOneToSixty: 22,
        aboveSixty: 19,
      }
    }
  },
  {
    size: '3.2mm',
    insulatorType: 'HIV',
    wireType: 'solid',
    isRecommended: true,
    ampacity: {
      outdoor: 75,
      indoorCounts: {
        belowThree: 52,
        four: 47,
        fiveToSix: 42,
        sevenToFifteen: 36,
        sixteenToForty: 32,
        fortyOneToSixty: 29,
        aboveSixty: 25,
      }
    }
  },
];

// HIVより線の許容電流データ
const strandedWireSizes: WireSize[] = [
  {
    size: '0.9mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/0.4mm',
    isRecommended: false, // 1.25mm²以下は一般配線に推奨されない
    ampacity: {
      outdoor: 20,
      indoorCounts: {
        belowThree: 14,
        four: 12,
        fiveToSix: 11,
        sevenToFifteen: 10,
        sixteenToForty: 8,
        fortyOneToSixty: 8,
        aboveSixty: 7,
      }
    }
  },
  {
    size: '1.25mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/0.45mm',
    isRecommended: false, // 1.25mm²以下は一般配線に推奨されない
    ampacity: {
      outdoor: 23,
      indoorCounts: {
        belowThree: 16,
        four: 14,
        fiveToSix: 13,
        sevenToFifteen: 11,
        sixteenToForty: 10,
        fortyOneToSixty: 9,
        aboveSixty: 8,
      }
    }
  },
  {
    size: '2mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/0.6mm',
    isRecommended: true,
    ampacity: {
      outdoor: 33,
      indoorCounts: {
        belowThree: 23,
        four: 20,
        fiveToSix: 18,
        sevenToFifteen: 16,
        sixteenToForty: 14,
        fortyOneToSixty: 13,
        aboveSixty: 11,
      }
    }
  },
  {
    size: '3.5mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/0.8mm',
    isRecommended: true,
    ampacity: {
      outdoor: 45,
      indoorCounts: {
        belowThree: 31,
        four: 28,
        fiveToSix: 25,
        sevenToFifteen: 22,
        sixteenToForty: 19,
        fortyOneToSixty: 17,
        aboveSixty: 15,
      }
    }
  },
  {
    size: '5.5mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/1.0mm',
    isRecommended: true,
    ampacity: {
      outdoor: 59,
      indoorCounts: {
        belowThree: 41,
        four: 37,
        fiveToSix: 33,
        sevenToFifteen: 29,
        sixteenToForty: 25,
        fortyOneToSixty: 23,
        aboveSixty: 20,
      }
    }
  },
  {
    size: '8mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/1.2mm',
    isRecommended: true,
    ampacity: {
      outdoor: 74,
      indoorCounts: {
        belowThree: 52,
        four: 46,
        fiveToSix: 41,
        sevenToFifteen: 36,
        sixteenToForty: 32,
        fortyOneToSixty: 29,
        aboveSixty: 25,
      }
    }
  },
  {
    size: '14mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/1.6mm',
    isRecommended: true,
    ampacity: {
      outdoor: 107,
      indoorCounts: {
        belowThree: 75,
        four: 67,
        fiveToSix: 60,
        sevenToFifteen: 52,
        sixteenToForty: 46,
        fortyOneToSixty: 41,
        aboveSixty: 36,
      }
    }
  },
  {
    size: '22mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/2.0mm',
    isRecommended: true,
    ampacity: {
      outdoor: 140,
      indoorCounts: {
        belowThree: 98,
        four: 88,
        fiveToSix: 78,
        sevenToFifteen: 68,
        sixteenToForty: 60,
        fortyOneToSixty: 54,
        aboveSixty: 47,
      }
    }
  },
  {
    size: '38mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '7本/2.6mm',
    isRecommended: true,
    ampacity: {
      outdoor: 197,
      indoorCounts: {
        belowThree: 138,
        four: 124,
        fiveToSix: 110,
        sevenToFifteen: 96,
        sixteenToForty: 84,
        fortyOneToSixty: 77,
        aboveSixty: 67,
      }
    }
  },
  {
    size: '60mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '19本/2.0mm',
    isRecommended: true,
    ampacity: {
      outdoor: 264,
      indoorCounts: {
        belowThree: 185,
        four: 166,
        fiveToSix: 148,
        sevenToFifteen: 129,
        sixteenToForty: 113,
        fortyOneToSixty: 103,
        aboveSixty: 89,
      }
    }
  },
  {
    size: '100mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '19本/2.6mm',
    isRecommended: true,
    ampacity: {
      outdoor: 363,
      indoorCounts: {
        belowThree: 254,
        four: 228,
        fiveToSix: 203,
        sevenToFifteen: 178,
        sixteenToForty: 156,
        fortyOneToSixty: 141,
        aboveSixty: 123,
      }
    }
  },
  {
    size: '150mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '37本/2.3mm',
    isRecommended: true,
    ampacity: {
      outdoor: 482,
      indoorCounts: {
        belowThree: 337,
        four: 303,
        fiveToSix: 270,
        sevenToFifteen: 236,  
        sixteenToForty: 207,
        fortyOneToSixty: 188,
        aboveSixty: 164,
      }
    }
  },
  {
    size: '200mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '37本/2.6mm',
    isRecommended: true,
    ampacity: {
      outdoor: 572,
      indoorCounts: {
        belowThree: 400,
        four: 360,
        fiveToSix: 320,
        sevenToFifteen: 280,
        sixteenToForty: 246,
        fortyOneToSixty: 223,
        aboveSixty: 194,
      }
    }
  },
  {
    size: '250mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '61本/2.3mm',
    isRecommended: true,
    ampacity: {
      outdoor: 678,
      indoorCounts: {
        belowThree: 474,
        four: 427,
        fiveToSix: 379,
        sevenToFifteen: 332,    
        sixteenToForty: 291,
        fortyOneToSixty: 264,
        aboveSixty: 230,
      }
    }
  },
  {
    size: '325mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '61本/2.6mm',
    isRecommended: true,
    ampacity: {
      outdoor: 793,
      indoorCounts: {
        belowThree: 555,
        four: 499,
        fiveToSix: 444,
        sevenToFifteen: 388, 
        sixteenToForty: 341,
        fortyOneToSixty: 309,
        aboveSixty: 269,
      }
    }
  },
  {
    size: '400mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '61本/2.9mm',
    isRecommended: true,
    ampacity: {
      outdoor: 909,
      indoorCounts: {
        belowThree: 636,
        four: 572,
        fiveToSix: 509,
        sevenToFifteen: 445,
        sixteenToForty: 391,
        fortyOneToSixty: 354,
        aboveSixty: 309,
      }
    }
  },
  {
    size: '500mm²',
    insulatorType: 'HIV',
    wireType: 'stranded',
    composition: '61本/3.2mm',
    isRecommended: true,
    ampacity: { 
      outdoor: 1027,
      indoorCounts: {
        belowThree: 719,
        four: 647,
        fiveToSix: 575,
        sevenToFifteen: 503,  
        sixteenToForty: 441,
        fortyOneToSixty: 400,
        aboveSixty: 349,
      }
    }
  },
];

export default function AmpacityScreen() {
  const { isDarkMode } = useTheme();
  const [selectedWireType, setSelectedWireType] = useState<'solid' | 'stranded'>('solid');
  const [selectedSize, setSelectedSize] = useState<WireSize | null>(null);
  const [selectedTemperature, setSelectedTemperature] = useState<TemperatureCorrection>(
    temperatureCorrections.find(t => t.temp === '30℃')!
  );
  const [isWireTypeExpanded, setIsWireTypeExpanded] = useState(false);
  const [isTemperatureExpanded, setIsTemperatureExpanded] = useState(false);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const tempAnimation = useRef(new Animated.Value(1)).current;
  const detailAnimation = useRef(new Animated.Value(0)).current;
  const wireTypeAnimation = useRef(new Animated.Value(1)).current;
  const wireTypeExpandAnimation = useRef(new Animated.Value(0)).current;
  const temperatureExpandAnimation = useRef(new Animated.Value(0)).current;

  // 現在選択されている導体タイプに基づいてデータを取得
  const currentWireSizes = selectedWireType === 'solid' ? solidWireSizes : strandedWireSizes;

  useEffect(() => {
    // 初期アニメーション
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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

  useEffect(() => {
    // 温度選択アニメーション
    Animated.sequence([
      Animated.timing(tempAnimation, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(tempAnimation, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [selectedTemperature]);

  useEffect(() => {
    // 導体タイプ切替アニメーション
    setSelectedSize(null);
    Animated.sequence([
      Animated.timing(wireTypeAnimation, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(wireTypeAnimation, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [selectedWireType]);

  useEffect(() => {
    // 導体タイプの折りたたみアニメーション
    Animated.timing(wireTypeExpandAnimation, {
      toValue: isWireTypeExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // heightの変更にはfalseが必要
    }).start();
  }, [isWireTypeExpanded]);

  useEffect(() => {
    // 温度選択の折りたたみアニメーション
    Animated.timing(temperatureExpandAnimation, {
      toValue: isTemperatureExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // heightの変更にはfalseが必要
    }).start();
  }, [isTemperatureExpanded]);

  const handleSizeSelect = (size: WireSize) => {
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

  const handleTemperatureSelect = (temp: TemperatureCorrection) => {
    setSelectedTemperature(temp);
    setIsTemperatureExpanded(false); // 選択後に折りたたむ
  };

  const handleWireTypeSelect = (wireType: 'solid' | 'stranded') => {
    setSelectedWireType(wireType);
    setIsWireTypeExpanded(false); // 選択後に折りたたむ
  };

  // 補正係数を適用した電流値を計算する関数
  const calculateCorrectedAmpacity = (value: number): number => {
    return Math.round(value * selectedTemperature.factor * 10) / 10;
  };

  /**
   * 導体径カードの表示部分
   * @param item - 導体径データ
   * @returns 導体径カード
   */
  const renderSizeCard = ({ item }: { item: WireSize }) => {
    const isSelected = selectedSize?.size === item.size;
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
        onPress={() => handleSizeSelect(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={[
            styles.sizeCard,
            {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
              borderColor: isSelected 
                ? isDarkMode ? '#4FC3F7' : '#2196F3' 
                : isDarkMode ? '#2A2A2A' : '#E0E0E0',
              transform: [{ scale: cardScale }]
            },
            !item.isRecommended && styles.notRecommendedCard
          ]}
        >
          <View style={styles.sizeHeader}>
            <View style={[styles.iconContainer, { 
              backgroundColor: isSelected ? '#2196F380' : '#2196F320',
            }]}>
              <Ionicons 
                name="flash" 
                size={24} 
                color={isDarkMode ? '#4FC3F7' : '#2196F3'} 
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.sizeTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {item.wireType === 'solid' ? '導体径: ' : '公称断面積: '}
                {item.size}
              </Text>
              <Text style={[styles.sizeSubtitle, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                {item.insulatorType} {item.wireType === 'solid' ? '単線' : `より線 (${item.composition})`}（絶縁体許容温度: 75℃）
              </Text>
              
              {!item.isRecommended && (
                <View style={styles.warningContainer}>
                  <Ionicons 
                    name="warning" 
                    size={16} 
                    color={isDarkMode ? '#FFA000' : '#FF6F00'} 
                  />
                  <Text style={[styles.warningText, { color: isDarkMode ? '#FFA000' : '#FF6F00' }]}>
                    一般配線には推奨されません
                  </Text>
                </View>
              )}
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
                styles.detailContainer,
                {
                  opacity: detailAnimation,
                  transform: [{ 
                    translateY: detailAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }
              ]}
            >
              <View style={styles.infoRow}>
                <View style={[styles.infoChip, { backgroundColor: isDarkMode ? '#2A2A2A' : '#E3F2FD' }]}>
                  <Text style={[styles.infoChipText, { color: isDarkMode ? '#FFFFFF' : '#0D47A1' }]}>
                    周囲温度: {selectedTemperature.temp}
                  </Text>
                </View>
                <View style={[styles.infoChip, { backgroundColor: isDarkMode ? '#2A2A2A' : '#E3F2FD' }]}>
                  <Text style={[styles.infoChipText, { color: isDarkMode ? '#FFFFFF' : '#0D47A1' }]}>
                    補正係数: {selectedTemperature.factor}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.ampacitySectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                がいし引き配線
              </Text>
              
              <View style={[styles.ampacityBox, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                  {calculateCorrectedAmpacity(item.ampacity.outdoor)}A
                </Text>
              </View>
              
              <Text style={[styles.ampacitySectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                IV電線を同一の管、線びまたはダクト内に収める場合の電線数
              </Text>
              
              <View style={styles.ampacityGrid}>
                <View style={[styles.ampacityItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                  <Text style={[styles.ampacityLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    3本以下
                  </Text>
                  <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                    {calculateCorrectedAmpacity(item.ampacity.indoorCounts.belowThree)}A
                  </Text>
                </View>
                <View style={[styles.ampacityItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                  <Text style={[styles.ampacityLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    4本
                  </Text>
                  <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                    {calculateCorrectedAmpacity(item.ampacity.indoorCounts.four)}A
                  </Text>
                </View>
                <View style={[styles.ampacityItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                  <Text style={[styles.ampacityLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    5〜6本
                  </Text>
                  <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                    {calculateCorrectedAmpacity(item.ampacity.indoorCounts.fiveToSix)}A
                  </Text>
                </View>
                <View style={[styles.ampacityItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                  <Text style={[styles.ampacityLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    7〜15本
                  </Text>
                  <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                    {calculateCorrectedAmpacity(item.ampacity.indoorCounts.sevenToFifteen)}A
                  </Text>
                </View>
                <View style={[styles.ampacityItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                  <Text style={[styles.ampacityLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    16〜40本
                  </Text>
                  <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                    {calculateCorrectedAmpacity(item.ampacity.indoorCounts.sixteenToForty)}A
                  </Text>
                </View>
                <View style={[styles.ampacityItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                  <Text style={[styles.ampacityLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    41〜60本
                  </Text>
                  <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                    {calculateCorrectedAmpacity(item.ampacity.indoorCounts.fortyOneToSixty)}A
                  </Text>
                </View>
                <View style={[styles.ampacityItem, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                  <Text style={[styles.ampacityLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    61本以上
                  </Text>
                  <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                    {calculateCorrectedAmpacity(item.ampacity.indoorCounts.aboveSixty)}A
                  </Text>
                </View>
              </View>
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
          title: 'IV線許容電流',
          headerStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
          },
          headerTintColor: isDarkMode ? '#FFFFFF' : '#000000',
          headerBackButtonDisplayMode: "minimal",
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
        {/* 内線規程の注記 */}
        <View style={styles.sourceContainer}>
          <Text style={[styles.sourceText, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
            ※内線規程より
          </Text>
        </View>
        
        {/* 使用制限の注意書き */}
        <View style={[styles.noticeContainer, { backgroundColor: isDarkMode ? '#333333' : '#FFF3E0' }]}>
          <Ionicons 
            name="information-circle" 
            size={20} 
            color={isDarkMode ? '#FFA000' : '#FF6F00'} 
          />
          <Text style={[styles.noticeText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
            直径1.2mm以下または断面積1.25mm²以下の電線は一般的に配線用として認められていません。あくまで参考値です。
          </Text>
        </View>
        
        {/* 導体形状選択セクション */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setIsWireTypeExpanded(!isWireTypeExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderContent}>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                導体形状
              </Text>
              <Text style={[styles.sectionValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                {selectedWireType === 'solid' ? '単線' : 'より線'}
              </Text>
            </View>
            <Ionicons 
              name={isWireTypeExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isDarkMode ? '#AAAAAA' : '#666666'} 
            />
          </View>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.wireTypeContainer,
            {
              height: wireTypeExpandAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 80] // 最大高さを調整
              }),
              opacity: wireTypeExpandAnimation,
              overflow: 'hidden',
            }
          ]}
        >
          <View style={styles.wireTypeButtonsContainer}>
            {wireTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: selectedWireType === option.id 
                      ? isDarkMode ? '#4FC3F7' : '#2196F3'
                      : isDarkMode ? '#2A2A2A' : '#F0F0F0',
                    minWidth: 80,
                  }
                ]}
                onPress={() => handleWireTypeSelect(option.id)}
              >
                <Text 
                  style={[
                    styles.optionButtonText, 
                    { 
                      color: selectedWireType === option.id 
                        ? '#FFFFFF' 
                        : isDarkMode ? '#FFFFFF' : '#000000' 
                    }
                  ]}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        
        {/* 周囲温度選択セクション */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setIsTemperatureExpanded(!isTemperatureExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderContent}>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                周囲温度
              </Text>
              <Text style={[styles.sectionValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                {selectedTemperature.temp}（補正係数: {selectedTemperature.factor}）
              </Text>
            </View>
            <Ionicons 
              name={isTemperatureExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isDarkMode ? '#AAAAAA' : '#666666'} 
            />
          </View>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.temperatureContainer,
            {
              height: temperatureExpandAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 80] // 最大高さを調整
              }),
              opacity: temperatureExpandAnimation,
              overflow: 'hidden',
            }
          ]}
        >
          <View style={styles.temperatureButtonsContainer}>
            {temperatureCorrections.map((temp) => (
              <TouchableOpacity
                key={temp.temp}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: selectedTemperature.temp === temp.temp 
                      ? isDarkMode ? '#4FC3F7' : '#2196F3'
                      : isDarkMode ? '#2A2A2A' : '#F0F0F0'
                  }
                ]}
                onPress={() => handleTemperatureSelect(temp)}
              >
                <Text 
                  style={[
                    styles.optionButtonText, 
                    { 
                      color: selectedTemperature.temp === temp.temp 
                        ? '#FFFFFF' 
                        : isDarkMode ? '#FFFFFF' : '#000000' 
                    }
                  ]}
                >
                  {temp.temp}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
      
      <FlatList
        data={currentWireSizes}
        renderItem={renderSizeCard}
        keyExtractor={item => item.size}
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    paddingVertical: 6,
    marginTop: 4,
    borderRadius: 8,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionValue: {
    fontSize: 14,
    marginTop: 2,
  },
  wireTypeContainer: {
    marginBottom: 8,
  },
  wireTypeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  temperatureContainer: {
    marginBottom: 8,
  },
  temperatureButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContainer: {
    padding: 12,
    paddingTop: 0,
  },
  sizeCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  sizeHeader: {
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
  sizeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sizeSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  detailContainer: {
    padding: 16,
    paddingTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  infoChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ampacitySectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  ampacityBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  ampacityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ampacityItem: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ampacityLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  ampacityValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sourceContainer: {
    paddingBottom: 6,
    alignItems: 'flex-end',
  },
  sourceText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  notRecommendedCard: {
    borderColor: '#FFA000',
    borderStyle: 'dashed',
  },
});