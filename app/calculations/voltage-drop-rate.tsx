import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions, ToastAndroid, Alert } from 'react-native';
import { useTheme } from '../_layout';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// 給電方式データ
const powerSupplyTypes = [
  { id: '1p2w100v', label: '1φ2W100V', voltage: 100, phase: 'single', wireCount: 2, factor: 35.6 },
  { id: '1p2w200v', label: '1φ2W200V', voltage: 200, phase: 'single', wireCount: 2, factor: 35.6 },
  { id: '1p3w', label: '1φ3W', voltage: 200, phase: 'single', wireCount: 3, factor: 17.8 },
  { id: '3p3w200v', label: '3φ3W200V', voltage: 200, phase: 'three', wireCount: 3, factor: 30.8 },
  { id: '3p3w415v', label: '3φ3W415V', voltage: 415, phase: 'three', wireCount: 3, factor: 30.8 },
  { id: '3p4w', label: '3φ4W', voltage: 415, phase: 'three', wireCount: 4, factor: 17.8 },
];

// 線種選択肢
const wireSizeOptions = ['2', '3.5', '5.5', '8', '14', '22', '38', '60', '100', '150', '200', '250', '325'];

// 線種ごとの許容電流表
const allowableCurrentTable: Record<string, Record<string, number>> = {
  '2': { '2': 28, '3': 23 },
  '3.5': { '2': 39, '3': 33 },
  '5.5': { '2': 52, '3': 44 },
  '8': { '2': 65, '3': 54 },
  '14': { '2': 91, '3': 86 },
  '22': { '2': 120, '3': 110 },
  '38': { '2': 165, '3': 155 },
  '60': { '2': 225, '3': 210 },
  '100': { '2': 310, '3': 290 },
  '150': { '2': 400, '3': 380 },
  '200': { '2': 490, '3': 465 },
  '250': { '2': 565, '3': 535 },
  '325': { '2': 670, '3': 635 }
};

export default function VoltageDropRateCalculator() {
  const { isDarkMode } = useTheme();
  const [reductionFactor, setReductionFactor] = useState('');
  const [powerSupply, setPowerSupply] = useState(powerSupplyTypes[0].id);
  const [breakerCurrent, setBreakerCurrent] = useState('');
  const [length, setLength] = useState('');
  const [mcbCurrent, setMcbCurrent] = useState('');
  const [loadCapacity, setLoadCapacity] = useState('');
  const [powerFactor, setPowerFactor] = useState('0.9');
  const [wireSize, setWireSize] = useState('14');
  
  // 計算結果
  const [loadCurrent, setLoadCurrent] = useState<number | null>(null);
  const [allowableCurrent, setAllowableCurrent] = useState<number | null>(null);
  const [voltageDrop, setVoltageDrop] = useState<number | null>(null);
  const [voltageDropRate, setVoltageDropRate] = useState<number | null>(null);
  const [isCalculationValid, setIsCalculationValid] = useState(false);
  
  // 表示状態
  const [showFormula, setShowFormula] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // バリデーションエラー
  const [validationErrors, setValidationErrors] = useState<{
    reductionFactor?: string;
    breakerCurrent?: string;
    length?: string;
    mcbCurrent?: string;
    loadCapacity?: string;
    powerFactor?: string;
  }>({});
  
  // アニメーション用
  const resultCardAnimation = useRef(new Animated.Value(0)).current;
  const errorShakeAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 選択した給電方式の情報を取得
  const getSelectedPowerSupply = () => {
    return powerSupplyTypes.find(type => type.id === powerSupply) || powerSupplyTypes[0];
  };
  
  // トースト表示 (iOS対応)
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // iOSの場合はAlertで代用
      Alert.alert('情報', message, [{ text: '閉じる' }], { cancelable: true });
    }
  };
  
  // バリデーションエラーをリセット
  const resetValidationErrors = () => {
    setValidationErrors({});
  };

  // 特定のフィールドをバリデーション
  const validateField = (field: string, value: string) => {
    const errors: { [key: string]: string } = { ...validationErrors };
    
    switch (field) {
      case 'reductionFactor':
        if (!value.trim()) {
          errors.reductionFactor = '低減率を入力してください';
        } else {
          const factor = parseFloat(value);
          if (isNaN(factor) || factor < 0.1 || factor > 2) {
            errors.reductionFactor = '0.1〜2の値を入力してください';
          } else {
            delete errors.reductionFactor;
          }
        }
        break;
      
      case 'breakerCurrent':
        if (!value.trim()) {
          errors.breakerCurrent = '遮断器定格電流を入力してください';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          errors.breakerCurrent = '正の数値を入力してください';
        } else {
          delete errors.breakerCurrent;
        }
        break;
      
      case 'length':
        if (!value.trim()) {
          errors.length = '電線長さを入力してください';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          errors.length = '正の数値を入力してください';
        } else {
          delete errors.length;
        }
        break;
      
      case 'mcbCurrent':
        if (!value.trim()) {
          errors.mcbCurrent = '主幹MCB定格電流を入力してください';
        } else {
          const mcbValue = parseFloat(value);
          const breakerValue = parseFloat(breakerCurrent);
          
          if (isNaN(mcbValue) || mcbValue <= 0) {
            errors.mcbCurrent = '正の数値を入力してください';
          } else if (!isNaN(breakerValue) && mcbValue > breakerValue) {
            errors.mcbCurrent = '幹線保護用遮断器定格以下の値を入力してください';
          } else {
            delete errors.mcbCurrent;
          }
        }
        break;
      
      case 'loadCapacity':
        if (!value.trim()) {
          errors.loadCapacity = '負荷容量を入力してください';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          errors.loadCapacity = '正の数値を入力してください';
        } else {
          delete errors.loadCapacity;
        }
        break;
      
      case 'powerFactor':
        if (!value.trim()) {
          errors.powerFactor = '力率を入力してください';
        } else {
          const factor = parseFloat(value);
          if (isNaN(factor) || factor <= 0 || factor > 1) {
            errors.powerFactor = '0〜1の値を入力してください';
          } else {
            delete errors.powerFactor;
          }
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  // フォームのバリデーション
  const validateForm = (): boolean => {
    const errors: {
      reductionFactor?: string;
      breakerCurrent?: string;
      length?: string;
      mcbCurrent?: string;
      loadCapacity?: string;
      powerFactor?: string;
    } = {};
    let isValid = true;

    // 電線許容電流低減率
    if (!reductionFactor.trim()) {
      errors.reductionFactor = '低減率を入力してください';
      isValid = false;
    } else {
      const factor = parseFloat(reductionFactor);
      if (isNaN(factor) || factor < 0.1 || factor > 2) {
        errors.reductionFactor = '0.1〜2の値を入力してください';
        isValid = false;
      }
    }

    // 幹線保護用遮断器定格電流
    if (!breakerCurrent.trim()) {
      errors.breakerCurrent = '遮断器定格電流を入力してください';
      isValid = false;
    } else if (isNaN(parseFloat(breakerCurrent)) || parseFloat(breakerCurrent) <= 0) {
      errors.breakerCurrent = '正の数値を入力してください';
      isValid = false;
    }

    // 電線長さ
    if (!length.trim()) {
      errors.length = '電線長さを入力してください';
      isValid = false;
    } else if (isNaN(parseFloat(length)) || parseFloat(length) <= 0) {
      errors.length = '正の数値を入力してください';
      isValid = false;
    }

    // 主幹MCB定格電流
    if (!mcbCurrent.trim()) {
      errors.mcbCurrent = '主幹MCB定格電流を入力してください';
      isValid = false;
    } else {
      const mcbValue = parseFloat(mcbCurrent);
      const breakerValue = parseFloat(breakerCurrent);
      
      if (isNaN(mcbValue) || mcbValue <= 0) {
        errors.mcbCurrent = '正の数値を入力してください';
        isValid = false;
      } else if (!isNaN(breakerValue) && mcbValue > breakerValue) {
        errors.mcbCurrent = '幹線保護用遮断器定格以下の値を入力してください';
        isValid = false;
      }
    }

    // 負荷容量
    if (!loadCapacity.trim()) {
      errors.loadCapacity = '負荷容量を入力してください';
      isValid = false;
    } else if (isNaN(parseFloat(loadCapacity)) || parseFloat(loadCapacity) <= 0) {
      errors.loadCapacity = '正の数値を入力してください';
      isValid = false;
    }

    // 力率
    if (!powerFactor.trim()) {
      errors.powerFactor = '力率を入力してください';
      isValid = false;
    } else {
      const factor = parseFloat(powerFactor);
      if (isNaN(factor) || factor <= 0 || factor > 1) {
        errors.powerFactor = '0〜1の値を入力してください';
        isValid = false;
      }
    }

    setValidationErrors(errors);

    if (!isValid) {
      // エラーがある場合、シェイクアニメーション
      Animated.sequence([
        Animated.timing(errorShakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    return isValid;
  };

  // 電圧降下率を計算する
  const calculateVoltageDropRate = () => {
    resetValidationErrors();
    
    if (!validateForm()) {
      return; // 検証に失敗した場合は処理を中止
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const selectedPowerSupply = getSelectedPowerSupply();
    const reductionFactorValue = parseFloat(reductionFactor);
    const lengthValue = parseFloat(length);
    const loadCapacityValue = parseFloat(loadCapacity);
    const powerFactorValue = parseFloat(powerFactor);
    const wireSizeValue = parseFloat(wireSize);
    
    // 許容電流の計算
    const wireCountKey = selectedPowerSupply.wireCount >= 3 ? '3' : '2';
    const baseAllowableCurrent = allowableCurrentTable[wireSize][wireCountKey];
    const calculatedAllowableCurrent = parseFloat((baseAllowableCurrent * reductionFactorValue).toFixed(1));
    
    // 負荷電流の計算
    let calculatedLoadCurrent;
    if (selectedPowerSupply.phase === 'single') {
      // 単相: I = 1000 * kW / (cosφ * V)
      calculatedLoadCurrent = Math.round(1000 * loadCapacityValue / (powerFactorValue * selectedPowerSupply.voltage));
    } else {
      // 三相: I = 1000 * kW / (cosφ * √3 * V)
      calculatedLoadCurrent = Math.round(1000 * loadCapacityValue / (powerFactorValue * Math.sqrt(3) * selectedPowerSupply.voltage));
    }
    
    // 電圧降下の計算: e = 係数 * L * I / (1000 * 断面積)
    const dropFactor = selectedPowerSupply.factor;
    const calculatedVoltageDrop = (dropFactor * lengthValue * calculatedLoadCurrent) / (1000 * wireSizeValue);
    
    // 電圧降下率の計算: (電圧降下 / 電圧) * 100
    const calculatedVoltageDropRate = (calculatedVoltageDrop / selectedPowerSupply.voltage) * 100;
    
    // 結果をセット
    setLoadCurrent(calculatedLoadCurrent);
    setAllowableCurrent(calculatedAllowableCurrent);
    setVoltageDrop(parseFloat(calculatedVoltageDrop.toFixed(3)));
    setVoltageDropRate(parseFloat(calculatedVoltageDropRate.toFixed(1)));
    
    // 電流値の検証
    const breakerCurrentValue = parseFloat(breakerCurrent);
    const mcbCurrentValue = parseFloat(mcbCurrent);
    const isBreakerValid = breakerCurrentValue >= calculatedLoadCurrent;
    const isMcbValid = mcbCurrentValue >= calculatedLoadCurrent;
    const isWireSizeValid = calculatedAllowableCurrent >= mcbCurrentValue;
    
    // 総合判定（遮断器容量と電圧降下率のみで判定）
    setIsCalculationValid(isBreakerValid && isMcbValid && isWireSizeValid);
    
    // 結果表示
    setShowResult(true);
    
    // 結果カードのアニメーション
    Animated.sequence([
      Animated.timing(resultCardAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true
      }),
      Animated.timing(resultCardAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();

    // 結果表示後、スクロールを上部に移動
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  // 計算式表示の切り替え
  const toggleFormula = () => {
    setShowFormula(!showFormula);
  };

  // スタイル
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
      padding: 16,
    },
    card: {
      backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 36,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    resultCard: {
      backgroundColor: isDarkMode ? '#2C2C2C' : '#f0f7ff',
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#d1e3ff',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
    },
    infoButton: {
      padding: 4,
    },
    inputGroup: {
      marginBottom: 16,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    label: {
      fontSize: 16,
      color: isDarkMode ? '#ddd' : '#333',
      flex: 1,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#ccc',
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      marginBottom: 4,
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
    },
    unitText: {
      paddingRight: 16,
      fontSize: 14,
      color: isDarkMode ? '#aaa' : '#888',
    },
    errorText: {
      color: '#ff6b6b',
      fontSize: 12,
      marginBottom: 8,
      marginLeft: 4,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#ccc',
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      marginBottom: 4,
      overflow: 'hidden',
    },
    picker: {
      height: 50,
      color: isDarkMode ? '#fff' : '#000',
      backgroundColor: 'transparent',
    },
    pickerAndroid: {
      color: isDarkMode ? '#fff' : '#000',
    },
    pickerIOS: {
      color: isDarkMode ? '#fff' : '#000',
    },
    wireOptionsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
      marginBottom: 8,
    },
    wireOption: {
      margin: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      borderWidth: 1,
    },
    wireOptionText: {
      fontSize: 14,
    },
    activeWireOption: {
      backgroundColor: isDarkMode ? '#1a4971' : '#e6f2ff',
      borderColor: isDarkMode ? '#3b82f6' : '#3b82f6',
    },
    inactiveWireOption: {
      backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
      borderColor: isDarkMode ? '#555' : '#ddd',
    },
    activeWireOptionText: {
      color: isDarkMode ? '#4dabf7' : '#0070f3',
      fontWeight: '500',
    },
    inactiveWireOptionText: {
      color: isDarkMode ? '#ccc' : '#666',
    },
    calculateButton: {
      backgroundColor: isDarkMode ? '#3b82f6' : '#0070f3',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginVertical: 16,
    },
    calculateButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: isDarkMode ? '#666' : '#ccc',
    },
    resultContainer: {
      borderRadius: 8,
      padding: 16,
      backgroundColor: isDarkMode ? '#252525' : '#f8faff',
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#e0e8ff',
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    resultLabel: {
      fontSize: 15,
      color: isDarkMode ? '#bbb' : '#666',
    },
    resultValue: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#333',
    },
    resultUnit: {
      fontSize: 14,
      color: isDarkMode ? '#bbb' : '#888',
    },
    highlightValue: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#4dabf7' : '#0070f3',
    },
    resultDivider: {
      height: 1,
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      marginVertical: 10,
    },
    badgeContainer: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    badgeText: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      fontSize: 14,
      fontWeight: '600',
      borderRadius: 16,
    },
    okBadge: {
      backgroundColor: isDarkMode ? '#1a5536' : '#e6ffef',
      color: isDarkMode ? '#40c28b' : '#0c8346',
    },
    ngBadge: {
      backgroundColor: isDarkMode ? '#551a1a' : '#ffebeb',
      color: isDarkMode ? '#c24040' : '#d32f2f',
    },
    formulaContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: isDarkMode ? '#252525' : '#f9f9f9',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#eee',
    },
    formulaTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#ddd' : '#333',
      marginBottom: 12,
    },
    formulaSection: {
      marginBottom: 12,
    },
    formulaSubtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#bbb' : '#555',
      marginBottom: 4,
    },
    formulaText: {
      fontSize: 14,
      color: isDarkMode ? '#ddd' : '#333',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 4,
    },
    formulaExample: {
      fontSize: 13,
      color: isDarkMode ? '#aaa' : '#777',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginLeft: 8,
    },
    explanationText: {
      fontSize: 14,
      color: isDarkMode ? '#bbb' : '#666',
      lineHeight: 20,
      marginBottom: 8,
    },
    powerSupplyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    powerSupplyCard: {
      width: '48%',
      margin: '1%',
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    activePowerSupply: {
      backgroundColor: isDarkMode ? '#1a4971' : '#e6f2ff',
      borderColor: isDarkMode ? '#3b82f6' : '#3b82f6',
    },
    inactivePowerSupply: {
      backgroundColor: isDarkMode ? '#292929' : '#f8f8f8',
      borderColor: isDarkMode ? '#444' : '#e0e0e0',
    },
    powerSupplyLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    activePowerSupplyLabel: {
      color: isDarkMode ? '#4dabf7' : '#0070f3',
    },
    inactivePowerSupplyLabel: {
      color: isDarkMode ? '#ddd' : '#333',
    },
    powerSupplyVoltage: {
      fontSize: 14,
    },
    activePowerSupplyVoltage: {
      color: isDarkMode ? '#a8d4ff' : '#0060df',
    },
    inactivePowerSupplyVoltage: {
      color: isDarkMode ? '#aaa' : '#666',
    },
    resultExplanation: {
      fontSize: 14,
      lineHeight: 20,
      color: isDarkMode ? '#bbb' : '#555',
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    explanationHighlight: {
      color: isDarkMode ? '#4dabf7' : '#0070f3',
      fontWeight: '600',
    },
    explanationNegative: {
      color: isDarkMode ? '#ff6b6b' : '#ff4d4d',
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Stack.Screen options={{ 
        title: '電圧降下率計算',
        headerShadowVisible: false,
        headerStyle: { 
          backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
        },
        headerTintColor: isDarkMode ? '#fff' : '#000',
        headerBackButtonDisplayMode: "minimal",
      }} />
      
      <ScrollView 
        style={styles.container}
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
      >
        {/* 結果表示カード */}
        {showResult && (
          <Animated.View 
            style={[
              styles.card, 
              styles.resultCard,
              { 
                opacity: resultCardAnimation,
                transform: [
                  { 
                    scale: resultCardAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.9, 1.05, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.headerRow}>
              <Text style={styles.title}>計算結果</Text>
              <TouchableOpacity style={styles.infoButton} onPress={toggleFormula}>
                <Ionicons name="information-circle-outline" size={24} color={isDarkMode ? '#ddd' : '#666'} />
              </TouchableOpacity>
            </View>
            
            {/* 計算結果の簡単な説明 */}
            <Text style={styles.resultExplanation}>
              下記の結果が全て<Text style={styles.explanationHighlight}>「✅ 適正」</Text>となっていることを確認してください。
              一つでも<Text style={styles.explanationNegative}>「❌」</Text>がある場合は、配線や機器の見直しが必要です。
            </Text>
            
            {/* 計算結果表示 */}
            <View style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>負荷電流:</Text>
                <Text style={styles.resultValue}>{loadCurrent} <Text style={styles.resultUnit}>A</Text></Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>許容電流:</Text>
                <Text style={styles.resultValue}>{allowableCurrent?.toFixed(1) || '0.0'} <Text style={styles.resultUnit}>A</Text></Text>
              </View>
              
              <View style={styles.resultDivider} />
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>幹線保護用遮断器:</Text>
                <View style={styles.badgeContainer}>
                  <Text 
                    style={[
                      styles.badgeText, 
                      loadCurrent && parseFloat(breakerCurrent) >= loadCurrent ? styles.okBadge : styles.ngBadge
                    ]}
                  >
                    {loadCurrent && parseFloat(breakerCurrent) >= loadCurrent ? 
                      '✅ 適正' : 
                      '❌ 容量不足'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>主幹MCB:</Text>
                <View style={styles.badgeContainer}>
                  <Text 
                    style={[
                      styles.badgeText, 
                      loadCurrent && parseFloat(mcbCurrent) >= loadCurrent ? styles.okBadge : styles.ngBadge
                    ]}
                  >
                    {loadCurrent && parseFloat(mcbCurrent) >= loadCurrent ? 
                      '✅ 適正' : 
                      '❌ 容量不足'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>幹線線種:</Text>
                <View style={styles.badgeContainer}>
                  <Text 
                    style={[
                      styles.badgeText, 
                      allowableCurrent && parseFloat(mcbCurrent) && allowableCurrent >= parseFloat(mcbCurrent) ? styles.okBadge : styles.ngBadge
                    ]}
                  >
                    {allowableCurrent && parseFloat(mcbCurrent) && allowableCurrent >= parseFloat(mcbCurrent) ? 
                      '✅ 適正' : 
                      '❌ 許容電流不足'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.resultDivider} />
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>電圧降下:</Text>
                <Text style={styles.resultValue}>{voltageDrop} <Text style={styles.resultUnit}>V</Text></Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>電圧降下率:</Text>
                <Text style={[styles.resultValue, styles.highlightValue]}>{voltageDropRate} <Text style={styles.resultUnit}>%</Text></Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>判定:</Text>
                <View style={styles.badgeContainer}>
                  <Text 
                    style={[
                      styles.badgeText, 
                      voltageDropRate && voltageDropRate <= 3 && isCalculationValid ? styles.okBadge : styles.ngBadge
                    ]}
                  >
                    {voltageDropRate && voltageDropRate <= 3 && isCalculationValid ? '✅ OK' : '❌ 要再検討'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* 計算式の表示 */}
            {showFormula && (
              <View style={styles.formulaContainer}>
                <Text style={styles.formulaTitle}>計算式と判定基準</Text>
                
                <View style={styles.formulaSection}>
                  <Text style={styles.formulaSubtitle}>負荷電流 (I)</Text>
                  {getSelectedPowerSupply().phase === 'single' ? (
                    <Text style={styles.formulaText}>I = 1000 × kW / (cosφ × V)</Text>
                  ) : (
                    <Text style={styles.formulaText}>I = 1000 × kW / (cosφ × √3 × V)</Text>
                  )}
                  <Text style={styles.formulaExample}>I = {loadCurrent} A</Text>
                </View>
                
                <View style={styles.formulaSection}>
                  <Text style={styles.formulaSubtitle}>許容電流</Text>
                  <Text style={styles.formulaText}>許容電流 = 基準値 × 低減率</Text>
                  <Text style={styles.formulaExample}>許容電流 = {allowableCurrentTable[wireSize][getSelectedPowerSupply().wireCount >= 3 ? '3' : '2']} × {reductionFactor} = {allowableCurrent?.toFixed(1) || '0.0'} A</Text>
                </View>
                
                <View style={styles.formulaSection}>
                  <Text style={styles.formulaSubtitle}>電圧降下 (e)</Text>
                  <Text style={styles.formulaText}>e = {getSelectedPowerSupply().factor} × L × I / (1000 × S)</Text>
                  <Text style={styles.formulaExample}>e = {getSelectedPowerSupply().factor} × {length} × {loadCurrent} / (1000 × {wireSize}) = {voltageDrop} V</Text>
                </View>
                
                <View style={styles.formulaSection}>
                  <Text style={styles.formulaSubtitle}>電圧降下率</Text>
                  <Text style={styles.formulaText}>電圧降下率 = (e / V) × 100</Text>
                  <Text style={styles.formulaExample}>電圧降下率 = ({voltageDrop} / {getSelectedPowerSupply().voltage}) × 100 = {voltageDropRate} %</Text>
                </View>
                
                <View style={styles.formulaSection}>
                  <Text style={styles.formulaSubtitle}>判定基準</Text>
                  <Text style={styles.explanationText}>• 幹線保護用遮断器の定格電流 ≧ 負荷電流</Text>
                  <Text style={styles.explanationText}>• 主幹MCBの定格電流 ≧ 負荷電流</Text>
                  <Text style={styles.explanationText}>• 幹線の許容電流 ≧ 主幹MCBの定格電流</Text>
                  <Text style={styles.explanationText}>• 電圧降下率 ≦ 3%</Text>
                </View>
              </View>
            )}
          </Animated.View>
        )}
        
        {/* 入力フォームカード */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>パラメータ入力</Text>
          </View>
          
          {/* 電線許容電流低減率 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>電線許容電流低減率</Text>
            </View>
            <Animated.View 
              style={[
                styles.inputContainer,
                validationErrors.reductionFactor ? { borderColor: '#ff6b6b' } : {},
                { transform: [{ translateX: errorShakeAnimation }] }
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="低減率を入力"
                placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
                keyboardType="numeric"
                value={reductionFactor}
                onChangeText={(text) => {
                  setReductionFactor(text);
                  validateField('reductionFactor', text);
                }}
              />
              <Text style={styles.unitText}>（0.1〜2）</Text>
            </Animated.View>
            {validationErrors.reductionFactor && <Text style={styles.errorText}>{validationErrors.reductionFactor}</Text>}
          </View>
          
          {/* 給電方式 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>給電方式</Text>
            </View>
            <View style={styles.powerSupplyGrid}>
              {powerSupplyTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.powerSupplyCard,
                    powerSupply === type.id ? styles.activePowerSupply : styles.inactivePowerSupply,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPowerSupply(type.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.powerSupplyLabel,
                      powerSupply === type.id ? styles.activePowerSupplyLabel : styles.inactivePowerSupplyLabel
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text 
                    style={[
                      styles.powerSupplyVoltage,
                      powerSupply === type.id ? styles.activePowerSupplyVoltage : styles.inactivePowerSupplyVoltage
                    ]}
                  >
                    電圧: {type.voltage}V
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 幹線保護用遮断器定格電流 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>幹線保護用遮断器定格電流</Text>
            </View>
            <Animated.View 
              style={[
                styles.inputContainer,
                validationErrors.breakerCurrent ? { borderColor: '#ff6b6b' } : {},
                { transform: [{ translateX: errorShakeAnimation }] }
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="定格電流を入力"
                placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
                keyboardType="numeric"
                value={breakerCurrent}
                onChangeText={(text) => {
                  setBreakerCurrent(text);
                  validateField('breakerCurrent', text);
                  // 主幹MCB電流も再検証（依存関係があるため）
                  if (mcbCurrent) {
                    validateField('mcbCurrent', mcbCurrent);
                  }
                }}
              />
              <Text style={styles.unitText}>A</Text>
            </Animated.View>
            {validationErrors.breakerCurrent && <Text style={styles.errorText}>{validationErrors.breakerCurrent}</Text>}
          </View>
          
          {/* 長さ */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>電線長さ</Text>
            </View>
            <Animated.View 
              style={[
                styles.inputContainer,
                validationErrors.length ? { borderColor: '#ff6b6b' } : {},
                { transform: [{ translateX: errorShakeAnimation }] }
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="長さを入力"
                placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
                keyboardType="numeric"
                value={length}
                onChangeText={(text) => {
                  setLength(text);
                  validateField('length', text);
                }}
              />
              <Text style={styles.unitText}>m</Text>
            </Animated.View>
            {validationErrors.length && <Text style={styles.errorText}>{validationErrors.length}</Text>}
          </View>
          
          {/* 主幹MCB定格電流 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>主幹MCB定格電流</Text>
            </View>
            <Animated.View 
              style={[
                styles.inputContainer,
                validationErrors.mcbCurrent ? { borderColor: '#ff6b6b' } : {},
                { transform: [{ translateX: errorShakeAnimation }] }
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="定格電流を入力"
                placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
                keyboardType="numeric"
                value={mcbCurrent}
                onChangeText={(text) => {
                  setMcbCurrent(text);
                  validateField('mcbCurrent', text);
                }}
              />
              <Text style={styles.unitText}>A</Text>
            </Animated.View>
            {validationErrors.mcbCurrent && <Text style={styles.errorText}>{validationErrors.mcbCurrent}</Text>}
          </View>
          
          {/* 負荷容量 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>負荷容量</Text>
            </View>
            <Animated.View 
              style={[
                styles.inputContainer,
                validationErrors.loadCapacity ? { borderColor: '#ff6b6b' } : {},
                { transform: [{ translateX: errorShakeAnimation }] }
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="負荷容量を入力"
                placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
                keyboardType="numeric"
                value={loadCapacity}
                onChangeText={(text) => {
                  setLoadCapacity(text);
                  validateField('loadCapacity', text);
                }}
              />
              <Text style={styles.unitText}>kW</Text>
            </Animated.View>
            {validationErrors.loadCapacity && <Text style={styles.errorText}>{validationErrors.loadCapacity}</Text>}
          </View>
          
          {/* 力率 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>力率</Text>
            </View>
            <Animated.View 
              style={[
                styles.inputContainer,
                validationErrors.powerFactor ? { borderColor: '#ff6b6b' } : {},
                { transform: [{ translateX: errorShakeAnimation }] }
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="力率を入力"
                placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
                keyboardType="numeric"
                value={powerFactor}
                onChangeText={(text) => {
                  setPowerFactor(text);
                  validateField('powerFactor', text);
                }}
              />
              <Text style={styles.unitText}>（cosφ）</Text>
            </Animated.View>
            {validationErrors.powerFactor && <Text style={styles.errorText}>{validationErrors.powerFactor}</Text>}
          </View>
          
          {/* 線種選択 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>幹線線種</Text>
            </View>
            <View style={styles.wireOptionsList}>
              {wireSizeOptions.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.wireOption,
                    wireSize === size ? styles.activeWireOption : styles.inactiveWireOption,
                  ]}
                  onPress={() => setWireSize(size)}
                >
                  <Text 
                    style={[
                      styles.wireOptionText,
                      wireSize === size ? styles.activeWireOptionText : styles.inactiveWireOptionText
                    ]}
                  >
                    {size} mm²
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 計算ボタン */}
          <TouchableOpacity
            style={[
              styles.calculateButton,
              (!reductionFactor || !breakerCurrent || !length || !mcbCurrent || !loadCapacity || !powerFactor) ? styles.disabledButton : {}
            ]}
            disabled={!reductionFactor || !breakerCurrent || !length || !mcbCurrent || !loadCapacity || !powerFactor}
            onPress={calculateVoltageDropRate}
          >
            <Text style={styles.calculateButtonText}>電圧降下率を計算</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 