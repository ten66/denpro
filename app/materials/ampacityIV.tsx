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
  { temp: '20℃', factor: 1.15 },
  { temp: '25℃', factor: 1.08 },
  { temp: '30℃', factor: 1.00 },
  { temp: '35℃', factor: 0.91 },
  { temp: '40℃', factor: 0.82 },
  { temp: '45℃', factor: 0.71 },
  { temp: '50℃', factor: 0.58 },
];

// 導体形状オプション
const wireTypeOptions: WireTypeOption[] = [
  { id: 'solid', name: '単線' },
  { id: 'stranded', name: 'より線' },
];

// IV単線の許容電流データ
const solidWireSizes: WireSize[] = [
  {
    size: '1.2mm',
    insulatorType: 'IV',
    wireType: 'solid',
    ampacity: {
      outdoor: 19,
      indoorCounts: {
        belowThree: 13,
        four: 12,
        fiveToSix: 10,
        sevenToFifteen: 9,
        sixteenToForty: 8,
        fortyOneToSixty: 7,
        aboveSixty: 6,
      }
    }
  },
  {
    size: '1.6mm',
    insulatorType: 'IV',
    wireType: 'solid',
    ampacity: {
      outdoor: 27,
      indoorCounts: {
        belowThree: 19,
        four: 17,
        fiveToSix: 15,
        sevenToFifteen: 13,
        sixteenToForty: 12,
        fortyOneToSixty: 11,
        aboveSixty: 9,
      }
    }
  },
  {
    size: '2.0mm',
    insulatorType: 'IV',
    wireType: 'solid',
    ampacity: {
      outdoor: 35,
      indoorCounts: {
        belowThree: 24,
        four: 22,
        fiveToSix: 19,
        sevenToFifteen: 17,
        sixteenToForty: 15,
        fortyOneToSixty: 14,
        aboveSixty: 12,
      }
    }
  },
  {
    size: '2.6mm',
    insulatorType: 'IV',
    wireType: 'solid',
    ampacity: {
      outdoor: 48,
      indoorCounts: {
        belowThree: 33,
        four: 30,
        fiveToSix: 27,
        sevenToFifteen: 23,
        sixteenToForty: 21,
        fortyOneToSixty: 19,
        aboveSixty: 17,
      }
    }
  },
  {
    size: '3.2mm',
    insulatorType: 'IV',
    wireType: 'solid',
    ampacity: {
      outdoor: 62,
      indoorCounts: {
        belowThree: 43,
        four: 38,
        fiveToSix: 34,
        sevenToFifteen: 30,
        sixteenToForty: 27,
        fortyOneToSixty: 24,
        aboveSixty: 21,
      }
    }
  },
];

// IVより線の許容電流データ
const strandedWireSizes: WireSize[] = [
  {
    size: '0.9mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/0.4mm',
    ampacity: {
      outdoor: 17,
      indoorCounts: {
        belowThree: 11,
        four: 10,
        fiveToSix: 9,
        sevenToFifteen: 8,
        sixteenToForty: 7,
        fortyOneToSixty: 6,
        aboveSixty: 5,
      }
    }
  },
  {
    size: '1.25mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/0.45mm',
    ampacity: {
      outdoor: 19,
      indoorCounts: {
        belowThree: 13,
        four: 11,
        fiveToSix: 10,
        sevenToFifteen: 9,
        sixteenToForty: 8,
        fortyOneToSixty: 7,
        aboveSixty: 6,
      }
    }
  },
  {
    size: '2mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/0.6mm',
    ampacity: {
      outdoor: 27,
      indoorCounts: {
        belowThree: 18,
        four: 17,
        fiveToSix: 15,
        sevenToFifteen: 13,
        sixteenToForty: 11,
        fortyOneToSixty: 10,
        aboveSixty: 9,
      }
    }
  },
  {
    size: '3.5mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/0.8mm',
    ampacity: {
      outdoor: 37,
      indoorCounts: {
        belowThree: 25,
        four: 23,
        fiveToSix: 20,
        sevenToFifteen: 18,
        sixteenToForty: 15,
        fortyOneToSixty: 14,
        aboveSixty: 12,
      }
    }
  },
  {
    size: '5.5mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/1.0mm',
    ampacity: {
      outdoor: 49,
      indoorCounts: {
        belowThree: 34,
        four: 31,
        fiveToSix: 27,
        sevenToFifteen: 24,
        sixteenToForty: 21,
        fortyOneToSixty: 19,
        aboveSixty: 16,
      }
    }
  },
  {
    size: '8mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/1.2mm',
    ampacity: {
      outdoor: 61,
      indoorCounts: {
        belowThree: 42,
        four: 38,
        fiveToSix: 34,
        sevenToFifteen: 30,
        sixteenToForty: 26,
        fortyOneToSixty: 24,
        aboveSixty: 21,
      }
    }
  },
  {
    size: '14mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/1.6mm',
    ampacity: {
      outdoor: 88,
      indoorCounts: {
        belowThree: 61,
        four: 55,
        fiveToSix: 49,
        sevenToFifteen: 43,
        sixteenToForty: 38,
        fortyOneToSixty: 34,
        aboveSixty: 30,
      }
    }
  },
  {
    size: '22mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/2.0mm',
    ampacity: {
      outdoor: 115,
      indoorCounts: {
        belowThree: 80,
        four: 72,
        fiveToSix: 64,
        sevenToFifteen: 56,
        sixteenToForty: 49,
        fortyOneToSixty: 45,
        aboveSixty: 39,
      }
    }
  },
  {
    size: '38mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '7本/2.6mm',
    ampacity: {
      outdoor: 162,
      indoorCounts: {
        belowThree: 113,
        four: 102,
        fiveToSix: 90,
        sevenToFifteen: 79,
        sixteenToForty: 70,
        fortyOneToSixty: 63,
        aboveSixty: 55,
      }
    }
  },
  {
    size: '60mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '19本/2.0mm',
    ampacity: {
      outdoor: 217,
      indoorCounts: {
        belowThree: 152,
        four: 136,
        fiveToSix: 121,
        sevenToFifteen: 106,
        sixteenToForty: 93,
        fortyOneToSixty: 85,
        aboveSixty: 74,
      }
    }
  },
  {
    size: '100mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '19本/2.6mm',
    ampacity: {
      outdoor: 298,
      indoorCounts: {
        belowThree: 208,
        four: 187,
        fiveToSix: 167,
        sevenToFifteen: 146,
        sixteenToForty: 128,
        fortyOneToSixty: 116,
        aboveSixty: 101,
      }
    }
  },
  {
    size: '150mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '37本/2.3mm',
    ampacity: {
      outdoor: 395,
      indoorCounts: {
        belowThree: 276,
        four: 249,
        fiveToSix: 221,
        sevenToFifteen: 193,  
        sixteenToForty: 170,
        fortyOneToSixty: 154,
        aboveSixty: 134,
      }
    }
  },
  {
    size: '200mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '37本/2.6mm',
    ampacity: {
      outdoor: 469,
      indoorCounts: {
        belowThree: 328,
        four: 295,
        fiveToSix: 262,
        sevenToFifteen: 230,
        sixteenToForty: 202,
        fortyOneToSixty: 183,
        aboveSixty: 159,
      }
    }
  },
  {
    size: '250mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '61本/2.3mm',
    ampacity: {
      outdoor: 556,
      indoorCounts: {
        belowThree: 389,
        four: 350,
        fiveToSix: 311,
        sevenToFifteen: 272,    
        sixteenToForty: 239,
        fortyOneToSixty: 217,
        aboveSixty: 189,
      }
    }
  },
  {
    size: '325mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '61本/2.6mm',
    ampacity: {
      outdoor: 650,
      indoorCounts: {
        belowThree: 455,
        four: 409,
        fiveToSix: 364,
        sevenToFifteen: 318, 
        sixteenToForty: 280,
        fortyOneToSixty: 254,
        aboveSixty: 221,
      }
    }
  },
  {
    size: '400mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '61本/2.9mm',
    ampacity: {
      outdoor: 745,
      indoorCounts: {
        belowThree: 521,
        four: 469,
        fiveToSix: 417,
        sevenToFifteen: 365,
        sixteenToForty: 320,
        fortyOneToSixty: 291,
        aboveSixty: 253,
      }
    }
  },
  {
    size: '500mm²',
    insulatorType: 'IV',
    wireType: 'stranded',
    composition: '61本/3.2mm',
    ampacity: { 
      outdoor: 842,
      indoorCounts: {
        belowThree: 589,
        four: 530,
        fiveToSix: 471,
        sevenToFifteen: 412,  
        sixteenToForty: 362,
        fortyOneToSixty: 328,
        aboveSixty: 286,
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
            }
          ]}
        >
          <View style={styles.sizeHeader}>
            <View style={[styles.iconContainer, { backgroundColor: isSelected ? '#2196F380' : '#2196F320' }]}>
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
                {item.insulatorType} {item.wireType === 'solid' ? '単線' : `より線 (${item.composition})`}（絶縁体許容温度: 60℃）
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
  }
});