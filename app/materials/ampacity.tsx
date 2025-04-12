import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';

// 許容電流のデータ定義
type WireSize = {
  size: string;
  insulatorType: string;
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

// IV単線の許容電流データ
const wireSizes: WireSize[] = [
  {
    size: '1.2mm',
    insulatorType: 'IV',
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

export default function AmpacityScreen() {
  const { isDarkMode } = useTheme();
  const [selectedSize, setSelectedSize] = useState<WireSize | null>(null);
  const [selectedTemperature, setSelectedTemperature] = useState<TemperatureCorrection>(
    temperatureCorrections.find(t => t.temp === '30℃')!
  );
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const tempAnimation = useRef(new Animated.Value(1)).current;
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
                導体径: {item.size}
              </Text>
              <Text style={[styles.sizeSubtitle, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                {item.insulatorType} 単線（絶縁体許容温度: 60℃）
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
              
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                がいし引き配線
              </Text>
              
              <View style={[styles.ampacityBox, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }]}>
                <Text style={[styles.ampacityValue, { color: isDarkMode ? '#4FC3F7' : '#2196F3' }]}>
                  {calculateCorrectedAmpacity(item.ampacity.outdoor)}A
                </Text>
              </View>
              
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
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
        
        <Animated.View 
          style={[
            styles.temperatureContainer,
            {
              transform: [{ scale: tempAnimation }]
            }
          ]}
        >
          <Text style={[styles.temperatureTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            周囲温度を選択:
          </Text>
          <View style={styles.temperatureButtonsContainer}>
            {temperatureCorrections.map((temp) => (
              <TouchableOpacity
                key={temp.temp}
                style={[
                  styles.temperatureButton,
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
                    styles.temperatureButtonText, 
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
        data={wireSizes}
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
  temperatureContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  temperatureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  temperatureButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  temperatureButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  temperatureButtonText: {
    fontSize: 13,
    fontWeight: '500',
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
  sectionTitle: {
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