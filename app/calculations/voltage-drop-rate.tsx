import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { useTheme } from '../_layout';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VoltageDropRateCalculator() {
  const { isDarkMode } = useTheme();
  const [length, setLength] = useState('');
  const [current, setCurrent] = useState('');
  const [wireSize, setWireSize] = useState('');
  const [voltage, setVoltage] = useState('');
  const [circuitType, setCircuitType] = useState('dc_single');
  const [result, setResult] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [calculationParams, setCalculationParams] = useState<{
    length: string;
    current: string;
    wireSize: string;
    voltage: string;
    circuitType: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    length?: string;
    current?: string;
    wireSize?: string;
    voltage?: string;
  }>({});

  // アニメーション用
  const resultAnimation = useRef(new Animated.Value(0)).current;
  const formulaAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const errorShakeAnimation = useRef(new Animated.Value(0)).current;

  // 一般的な電線サイズの例（参考表示用）
  const commonWireSizes = [2, 3.5, 5.5, 8, 14, 22, 38, 60, 100, 150, 200, 250];

  // 計算タイプ
  const circuitTypes = [
    { 
      id: 'dc_single', 
      label: '直流および単相2線式', 
      factor: 35.6,
      formula: 'e = 35.6 × L × I / (1000 × S)'
    },
    { 
      id: 'three_phase', 
      label: '三相3線式', 
      factor: 30.8,
      formula: 'e = 30.8 × L × I / (1000 × S)'
    },
    { 
      id: 'neutral', 
      label: '直流3線式・単相3線式・三相4線式', 
      factor: 17.8,
      formula: "e' = 17.8 × L × I / (1000 × S)"
    },
  ];

  // 現在の回路タイプの取得
  const getCurrentCircuitType = () => {
    return circuitTypes.find(type => type.id === circuitType) || circuitTypes[0];
  };

  // 入力のリセット
  const resetValidationErrors = () => {
    setValidationErrors({});
  };

  // フォームの検証
  const validateForm = (): boolean => {
    const errors: {
      length?: string;
      current?: string;
      wireSize?: string;
      voltage?: string;
    } = {};
    let isValid = true;

    if (!length.trim()) {
      errors.length = '電線長さを入力してください';
      isValid = false;
    } else if (isNaN(parseFloat(length)) || parseFloat(length) <= 0) {
      errors.length = '正の数値を入力してください';
      isValid = false;
    }

    if (!current.trim()) {
      errors.current = '電流を入力してください';
      isValid = false;
    } else if (isNaN(parseFloat(current)) || parseFloat(current) <= 0) {
      errors.current = '正の数値を入力してください';
      isValid = false;
    }

    if (!wireSize.trim()) {
      errors.wireSize = '電線の断面積を入力してください';
      isValid = false;
    } else if (isNaN(parseFloat(wireSize)) || parseFloat(wireSize) <= 0) {
      errors.wireSize = '正の数値を入力してください';
      isValid = false;
    }

    if (!voltage.trim()) {
      errors.voltage = '電圧を入力してください';
      isValid = false;
    } else if (isNaN(parseFloat(voltage)) || parseFloat(voltage) <= 0) {
      errors.voltage = '正の数値を入力してください';
      isValid = false;
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
    }

    return isValid;
  };

  // 電圧降下率の計算
  const calculateVoltageDropRate = () => {
    resetValidationErrors();
    
    if (!validateForm()) {
      return; // 検証に失敗した場合は処理を中止
    }
    
    const lengthValue = parseFloat(length);
    const currentValue = parseFloat(current);
    const wireSizeValue = parseFloat(wireSize);
    const voltageValue = parseFloat(voltage);
    const currentType = getCurrentCircuitType();
    
    // 電圧降下を計算
    // e = factor * L * I / (1000 * S)
    const dropValue = (currentType.factor * lengthValue * currentValue) / (1000 * wireSizeValue);
    
    // 電圧降下率 = (電圧降下 / 電圧) * 100
    const dropRateValue = (dropValue / voltageValue) * 100;
    
    // 小数点以下第3位まで表示（四捨五入）
    setResult(parseFloat(dropRateValue.toFixed(3)));
    
    // 計算に使用したパラメータを保存
    setCalculationParams({
      length,
      current,
      wireSize,
      voltage,
      circuitType: currentType.label
    });
    
    // 結果のアニメーション
    Animated.sequence([
      Animated.timing(resultAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(resultAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();

    // 結果が表示されたらスクロールを上部に移動
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  // 計算式表示の切り替え
  const toggleFormula = () => {
    setShowFormula(!showFormula);
    
    Animated.timing(formulaAnimation, {
      toValue: showFormula ? 0 : 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  // よく使われる電線サイズを選択する
  const selectCommonWireSize = (size: number) => {
    setWireSize(size.toString());
  };

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
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
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
    resultCard: {
      backgroundColor: isDarkMode ? '#2C2C2C' : '#f0f7ff',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#d1e3ff',
    },
    resultPlaceholder: {
      fontSize: 16,
      color: isDarkMode ? '#888' : '#888',
      textAlign: 'center',
      paddingVertical: 12,
    },
    resultValue: {
      fontSize: 36,
      fontWeight: 'bold',
      color: isDarkMode ? '#4dabf7' : '#0070f3',
      marginBottom: 8,
    },
    resultUnit: {
      fontSize: 16,
      color: isDarkMode ? '#bbb' : '#666',
    },
    resultParams: {
      marginTop: 12,
      padding: 12,
      backgroundColor: isDarkMode ? '#222' : '#e6f0ff',
      borderRadius: 8,
      width: '100%',
    },
    resultParamRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    resultParamLabel: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#666',
    },
    resultParamValue: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#fff' : '#333',
    },
    label: {
      fontSize: 16,
      marginBottom: 6,
      color: isDarkMode ? '#ddd' : '#333',
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
      marginBottom: 12,
      marginLeft: 4,
    },
    circuitTypeContainer: {
      marginBottom: 16,
    },
    circuitTypeTitle: {
      fontSize: 16,
      marginBottom: 8,
      color: isDarkMode ? '#ddd' : '#333',
    },
    circuitTypeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    circuitTypeButton: {
      flex: 1,
      minWidth: '30%',
      margin: 4,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    circuitTypeText: {
      fontSize: 13,
      textAlign: 'center',
    },
    activeButton: {
      backgroundColor: isDarkMode ? '#1a4971' : '#e6f2ff',
      borderColor: isDarkMode ? '#3b82f6' : '#3b82f6',
    },
    inactiveButton: {
      backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
      borderColor: isDarkMode ? '#555' : '#ddd',
    },
    activeText: {
      color: isDarkMode ? '#4dabf7' : '#0070f3',
      fontWeight: '500',
    },
    inactiveText: {
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
    formulaContainer: {
      padding: 16,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f9f9f9',
      borderRadius: 8,
      marginVertical: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#eee',
    },
    formulaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    formulaTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#ddd' : '#333',
    },
    formulaText: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#666',
      marginBottom: 8,
    },
    formulaDescription: {
      fontSize: 14,
      color: isDarkMode ? '#bbb' : '#555',
      lineHeight: 20,
    },
    formulaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 4,
    },
    formulaVariable: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isDarkMode ? '#4dabf7' : '#0070f3',
      marginRight: 8,
    },
    formulaEquals: {
      fontSize: 14,
      color: isDarkMode ? '#ddd' : '#333',
      marginRight: 8,
    },
    formulaDefinition: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#666',
    },
    wireSizeListTitle: {
      fontSize: 14,
      marginTop: 8,
      marginBottom: 8,
      color: isDarkMode ? '#ddd' : '#333',
    },
    wireSizeList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    wireSizeButton: {
      margin: 4,
      padding: 8,
      borderRadius: 4,
      borderWidth: 1,
    },
    wireSizeButtonText: {
      fontSize: 12,
    },
    footer: {
      marginTop: 12,
      marginBottom: 32,
      padding: 16,
      backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
      borderRadius: 8,
    },
    footerText: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#999',
      lineHeight: 18,
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
      }} />
      
      <ScrollView 
        style={styles.container}
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
      >
        {/* 結果表示カード */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>電圧降下率</Text>
            <TouchableOpacity style={styles.infoButton} onPress={toggleFormula}>
              <Ionicons name="information-circle-outline" size={24} color={isDarkMode ? '#ddd' : '#666'} />
            </TouchableOpacity>
          </View>
          
          {/* 計算結果 */}
          <Animated.View style={[
            styles.resultCard,
            { opacity: resultAnimation, transform: [{ scale: resultAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }
          ]}>
            {result !== null ? (
              <>
                <Text style={styles.resultValue}>{result}</Text>
                <Text style={styles.resultUnit}>%</Text>
                
                {/* 計算に使用したパラメータ */}
                {calculationParams && (
                  <View style={styles.resultParams}>
                    <View style={styles.resultParamRow}>
                      <Text style={styles.resultParamLabel}>電線長さ:</Text>
                      <Text style={styles.resultParamValue}>{calculationParams.length} m</Text>
                    </View>
                    <View style={styles.resultParamRow}>
                      <Text style={styles.resultParamLabel}>電流:</Text>
                      <Text style={styles.resultParamValue}>{calculationParams.current} A</Text>
                    </View>
                    <View style={styles.resultParamRow}>
                      <Text style={styles.resultParamLabel}>電線断面積:</Text>
                      <Text style={styles.resultParamValue}>{calculationParams.wireSize} mm²</Text>
                    </View>
                    <View style={styles.resultParamRow}>
                      <Text style={styles.resultParamLabel}>電圧:</Text>
                      <Text style={styles.resultParamValue}>{calculationParams.voltage} V</Text>
                    </View>
                    <View style={styles.resultParamRow}>
                      <Text style={styles.resultParamLabel}>回路タイプ:</Text>
                      <Text style={styles.resultParamValue}>{calculationParams.circuitType}</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.resultPlaceholder}>パラメータを入力して計算ボタンを押してください</Text>
            )}
          </Animated.View>
          
          {/* 計算式の表示 */}
          {showFormula && (
            <Animated.View 
              style={[
                styles.formulaContainer,
                {
                  opacity: formulaAnimation,
                  transform: [{ 
                    translateY: formulaAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }]
                }
              ]}
            >
              <View style={styles.formulaHeader}>
                <Text style={styles.formulaTitle}>計算式</Text>
              </View>
              
              <Text style={styles.formulaText}>電圧降下率（%）= 電圧降下（V）÷ 電圧（V）× 100</Text>
              
              <Text style={styles.formulaText}>電圧降下の計算式:</Text>
              <Text style={styles.formulaText}>{getCurrentCircuitType().formula}</Text>
              
              <View style={styles.formulaRow}>
                <Text style={styles.formulaVariable}>e</Text>
                <Text style={styles.formulaEquals}>=</Text>
                <Text style={styles.formulaDefinition}>電圧降下（V）</Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaVariable}>L</Text>
                <Text style={styles.formulaEquals}>=</Text>
                <Text style={styles.formulaDefinition}>電線の長さ（m）</Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaVariable}>I</Text>
                <Text style={styles.formulaEquals}>=</Text>
                <Text style={styles.formulaDefinition}>電流（A）</Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaVariable}>S</Text>
                <Text style={styles.formulaEquals}>=</Text>
                <Text style={styles.formulaDefinition}>電線の断面積（mm²）</Text>
              </View>
            </Animated.View>
          )}
        </View>
        
        {/* 入力フォーム */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>パラメータ入力</Text>
          </View>
          
          {/* 電線長さ入力 */}
          <Text style={styles.label}>電線長さ（片道）</Text>
          <Animated.View 
            style={[
              styles.inputContainer,
              { transform: [{ translateX: errorShakeAnimation }] }
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="電線長さを入力"
              placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
              keyboardType="numeric"
              value={length}
              onChangeText={setLength}
            />
            <Text style={styles.unitText}>m</Text>
          </Animated.View>
          {validationErrors.length && <Text style={styles.errorText}>{validationErrors.length}</Text>}
          
          {/* 電流入力 */}
          <Text style={styles.label}>電流</Text>
          <Animated.View 
            style={[
              styles.inputContainer,
              { transform: [{ translateX: errorShakeAnimation }] }
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="電流を入力"
              placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
              keyboardType="numeric"
              value={current}
              onChangeText={setCurrent}
            />
            <Text style={styles.unitText}>A</Text>
          </Animated.View>
          {validationErrors.current && <Text style={styles.errorText}>{validationErrors.current}</Text>}
          
          {/* 電線断面積入力 */}
          <Text style={styles.label}>電線断面積</Text>
          <Animated.View 
            style={[
              styles.inputContainer,
              { transform: [{ translateX: errorShakeAnimation }] }
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="電線断面積を入力"
              placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
              keyboardType="numeric"
              value={wireSize}
              onChangeText={setWireSize}
            />
            <Text style={styles.unitText}>mm²</Text>
          </Animated.View>
          {validationErrors.wireSize && <Text style={styles.errorText}>{validationErrors.wireSize}</Text>}
          
          {/* 電圧入力 */}
          <Text style={styles.label}>電圧</Text>
          <Animated.View 
            style={[
              styles.inputContainer,
              { transform: [{ translateX: errorShakeAnimation }] }
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="電圧を入力"
              placeholderTextColor={isDarkMode ? '#666' : '#ccc'}
              keyboardType="numeric"
              value={voltage}
              onChangeText={setVoltage}
            />
            <Text style={styles.unitText}>V</Text>
          </Animated.View>
          {validationErrors.voltage && <Text style={styles.errorText}>{validationErrors.voltage}</Text>}
          
          {/* よく使われる電線サイズ */}
          <Text style={styles.wireSizeListTitle}>一般的な電線断面積 (mm²)</Text>
          <View style={styles.wireSizeList}>
            {commonWireSizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.wireSizeButton,
                  {
                    backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
                    borderColor: isDarkMode ? '#444' : '#ddd',
                  }
                ]}
                onPress={() => selectCommonWireSize(size)}
              >
                <Text 
                  style={[
                    styles.wireSizeButtonText,
                    { color: isDarkMode ? '#ccc' : '#666' }
                  ]}
                >
                  {size} mm²
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* 回路タイプ選択 */}
          <View style={styles.circuitTypeContainer}>
            <Text style={styles.circuitTypeTitle}>回路タイプ</Text>
            <View style={styles.circuitTypeRow}>
              {circuitTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.circuitTypeButton,
                    circuitType === type.id ? styles.activeButton : styles.inactiveButton,
                  ]}
                  onPress={() => setCircuitType(type.id)}
                >
                  <Text 
                    style={[
                      styles.circuitTypeText,
                      circuitType === type.id ? styles.activeText : styles.inactiveText,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 計算ボタン */}
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateVoltageDropRate}
          >
            <Text style={styles.calculateButtonText}>電圧降下率を計算</Text>
          </TouchableOpacity>
        </View>
        
        {/* 注釈 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            注意: この計算は簡易的な計算方法に基づいています。詳細な設計には専門家の判断を仰いでください。
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 