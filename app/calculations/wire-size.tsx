import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { useTheme } from '../_layout';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WireSizeCalculator() {
  const { isDarkMode } = useTheme();
  const [length, setLength] = useState('');
  const [current, setCurrent] = useState('');
  const [voltageDrop, setVoltageDrop] = useState('');
  const [circuitType, setCircuitType] = useState('dc_single');
  const [result, setResult] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [calculationParams, setCalculationParams] = useState<{
    length: string;
    current: string;
    voltageDrop: string;
    circuitType: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    length?: string;
    current?: string;
    voltageDrop?: string;
  }>({});

  // アニメーション用
  const resultAnimation = useRef(new Animated.Value(0)).current;
  const formulaAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const errorShakeAnimation = useRef(new Animated.Value(0)).current;

  // 計算タイプ
  const circuitTypes = [
    { 
      id: 'dc_single', 
      label: '直流および単相2線式', 
      factor: 35.6,
      formula: 'S = 35.6 × L × I / (1000 × e)'
    },
    { 
      id: 'three_phase', 
      label: '三相3線式', 
      factor: 30.8,
      formula: 'S = 30.8 × L × I / (1000 × e)'
    },
    { 
      id: 'neutral', 
      label: '直流3線式・単相3線式・三相4線式', 
      factor: 17.8,
      formula: "S = 17.8 × L × I / (1000 × e')"
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
      voltageDrop?: string;
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

    if (!voltageDrop.trim()) {
      errors.voltageDrop = '電圧降下を入力してください';
      isValid = false;
    } else if (isNaN(parseFloat(voltageDrop)) || parseFloat(voltageDrop) <= 0) {
      errors.voltageDrop = '正の数値を入力してください';
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

  // 電線断面積の計算
  const calculateWireSize = () => {
    resetValidationErrors();
    
    if (!validateForm()) {
      return; // 検証に失敗した場合は処理を中止
    }
    
    const lengthValue = parseFloat(length);
    const currentValue = parseFloat(current);
    const voltageDropValue = parseFloat(voltageDrop);
    const currentType = getCurrentCircuitType();
    
    // 正しい計算式に基づいて電線断面積を計算
    // S = factor * L * I / (1000 * e)
    const wireSizeValue = (currentType.factor * lengthValue * currentValue) / (1000 * voltageDropValue);
    
    // 小数点以下第3位まで表示（四捨五入）
    setResult(parseFloat(wireSizeValue.toFixed(3)));
    
    // 計算に使用したパラメータを保存
    setCalculationParams({
      length,
      current,
      voltageDrop,
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
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
    },
    formulaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    formulaButtonText: {
      color: isDarkMode ? '#ddd' : '#555',
      fontSize: 14,
      marginRight: 4,
    },
    formulaContainer: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: isDarkMode ? '#4dabf7' : '#0070f3',
    },
    formulaText: {
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: 16,
      color: isDarkMode ? '#ddd' : '#333',
      lineHeight: 24,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      marginBottom: 8,
      color: isDarkMode ? '#ddd' : '#333',
    },
    textInput: {
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
    },
    textInputError: {
      borderColor: '#ff5252',
    },
    errorMessage: {
      color: '#ff5252',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    circuitTypeCard: {
      marginBottom: 16,
    },
    circuitTypeHeader: {
      fontSize: 14,
      marginBottom: 8,
      color: isDarkMode ? '#ddd' : '#333',
    },
    circuitTypeOptions: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8',
      borderRadius: 8,
      overflow: 'hidden',
    },
    circuitTypeOption: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#444' : '#e0e0e0',
      flexDirection: 'row',
      alignItems: 'center',
    },
    circuitTypeOptionLast: {
      borderBottomWidth: 0,
    },
    circuitTypeRadio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: isDarkMode ? '#4dabf7' : '#0070f3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    circuitTypeRadioSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isDarkMode ? '#4dabf7' : '#0070f3',
    },
    circuitTypeLabel: {
      color: isDarkMode ? '#ddd' : '#333',
      fontSize: 14,
    },
    calculateButton: {
      backgroundColor: isDarkMode ? '#4dabf7' : '#0070f3',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    calculateButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    resultCard: {
      backgroundColor: isDarkMode ? '#253341' : '#e6f2ff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: isDarkMode ? '#4dabf7' : '#0070f3',
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    resultHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
    },
    resultContainer: {
      alignItems: 'center',
      padding: 16,
    },
    resultLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: isDarkMode ? '#ddd' : '#333',
      textAlign: 'center',
    },
    resultValueContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    resultValue: {
      fontSize: 40,
      fontWeight: 'bold',
      color: isDarkMode ? '#4dabf7' : '#0070f3',
    },
    resultUnit: {
      fontSize: 20,
      color: isDarkMode ? '#ddd' : '#555',
      marginBottom: 8,
      marginLeft: 4,
    },
    resultCircle: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 10,
      borderColor: isDarkMode ? 'rgba(77, 171, 247, 0.1)' : 'rgba(0, 112, 243, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: -1,
    },
    paramSummary: {
      marginTop: 16,
      padding: 12,
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
      borderRadius: 8,
    },
    paramRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    paramLabel: {
      flex: 1,
      fontSize: 13,
      color: isDarkMode ? '#bbb' : '#555',
    },
    paramValue: {
      flex: 1,
      fontSize: 13,
      fontWeight: 'bold',
      color: isDarkMode ? '#ddd' : '#333',
      textAlign: 'right',
    },
    inputCard: {
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
    infoCard: {
      backgroundColor: isDarkMode ? '#253341' : '#e6f2ff',
      borderRadius: 12,
      padding: 16,
      marginTop: 24,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: isDarkMode ? '#ddd' : '#0070f3',
    },
    infoText: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#555',
      lineHeight: 20,
    },
    variableRow: {
      flexDirection: 'row',
      marginBottom: 6
    },
    variableSymbol: {
      width: 30,
      fontWeight: 'bold',
      color: isDarkMode ? '#4dabf7' : '#0070f3',
    },
    variableDesc: {
      flex: 1,
      color: isDarkMode ? '#ccc' : '#555',
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen
        options={{
          title: '電線断面積計算',
          headerStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
          },
          headerTintColor: isDarkMode ? '#FFFFFF' : '#000000',
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <ScrollView 
        style={styles.container}
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled" // キーボード表示中でもタップイベントを処理
      >
        {/* 計算結果表示カード */}
        {result !== null && calculationParams !== null && (
          <Animated.View 
            style={[
              styles.resultCard,
              {
                opacity: resultAnimation,
                transform: [{
                  translateY: resultAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.resultRow}>
              <Text style={styles.resultHeader}>計算結果</Text>
            </View>
            
            <View style={styles.resultContainer}>
              <View style={styles.resultCircle} />
              <Text style={styles.resultLabel}>必要な電線の断面積</Text>
              <View style={styles.resultValueContainer}>
                <Animated.Text 
                  style={[
                    styles.resultValue,
                    {
                      transform: [{
                        scale: resultAnimation.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.8, 1.1, 1]
                        })
                      }]
                    }
                  ]}
                >
                  {result}
                </Animated.Text>
                <Text style={styles.resultUnit}>mm²</Text>
              </View>
            </View>
            
            <View style={styles.paramSummary}>
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>計算タイプ:</Text>
                <Text style={styles.paramValue}>{calculationParams.circuitType}</Text>
              </View>
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>電線の長さ:</Text>
                <Text style={styles.paramValue}>{calculationParams.length} m</Text>
              </View>
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>電流:</Text>
                <Text style={styles.paramValue}>{calculationParams.current} A</Text>
              </View>
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>電圧降下:</Text>
                <Text style={styles.paramValue}>{calculationParams.voltageDrop} V</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* 入力フォームカード */}
        <Animated.View 
          style={[
            styles.inputCard,
            { transform: [{ translateX: errorShakeAnimation }] }
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>電線断面積計算</Text>
            <TouchableOpacity style={styles.formulaButton} onPress={toggleFormula}>
              <Text style={styles.formulaButtonText}>計算式</Text>
              <Ionicons name={showFormula ? "chevron-up" : "chevron-down"} size={16} color={isDarkMode ? '#ddd' : '#555'} />
            </TouchableOpacity>
          </View>
          
          {showFormula && (
            <Animated.View 
              style={[
                styles.formulaContainer,
                {
                  opacity: formulaAnimation,
                  transform: [{
                    translateY: formulaAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.formulaText}>{getCurrentCircuitType().formula}</Text>
            </Animated.View>
          )}
          
          <View style={styles.circuitTypeCard}>
            <Text style={styles.circuitTypeHeader}>計算タイプ</Text>
            <View style={styles.circuitTypeOptions}>
              {circuitTypes.map((type, index) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.circuitTypeOption,
                    index === circuitTypes.length - 1 && styles.circuitTypeOptionLast
                  ]}
                  onPress={() => setCircuitType(type.id)}
                >
                  <View style={styles.circuitTypeRadio}>
                    {circuitType === type.id && <View style={styles.circuitTypeRadioSelected} />}
                  </View>
                  <Text style={styles.circuitTypeLabel}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>L: 電線の長さ (m)</Text>
            <TextInput
              style={[
                styles.textInput,
                validationErrors.length && styles.textInputError
              ]}
              keyboardType="numeric"
              value={length}
              onChangeText={(text) => {
                setLength(text);
                if (validationErrors.length) {
                  setValidationErrors(prev => ({ ...prev, length: undefined }));
                }
              }}
              placeholder="電線の長さを入力"
              placeholderTextColor={isDarkMode ? '#777' : '#999'}
            />
            {validationErrors.length && (
              <Text style={styles.errorMessage}>{validationErrors.length}</Text>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>I: 電流 (A)</Text>
            <TextInput
              style={[
                styles.textInput,
                validationErrors.current && styles.textInputError
              ]}
              keyboardType="numeric"
              value={current}
              onChangeText={(text) => {
                setCurrent(text);
                if (validationErrors.current) {
                  setValidationErrors(prev => ({ ...prev, current: undefined }));
                }
              }}
              placeholder="電流値を入力"
              placeholderTextColor={isDarkMode ? '#777' : '#999'}
            />
            {validationErrors.current && (
              <Text style={styles.errorMessage}>{validationErrors.current}</Text>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{circuitType === 'neutral' ? "e': 電圧降下 (V)" : "e: 電圧降下 (V)"}</Text>
            <TextInput
              style={[
                styles.textInput,
                validationErrors.voltageDrop && styles.textInputError
              ]}
              keyboardType="numeric"
              value={voltageDrop}
              onChangeText={(text) => {
                setVoltageDrop(text);
                if (validationErrors.voltageDrop) {
                  setValidationErrors(prev => ({ ...prev, voltageDrop: undefined }));
                }
              }}
              placeholder="電圧降下を入力"
              placeholderTextColor={isDarkMode ? '#777' : '#999'}
              onSubmitEditing={calculateWireSize}
            />
            {validationErrors.voltageDrop && (
              <Text style={styles.errorMessage}>{validationErrors.voltageDrop}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateWireSize}
            activeOpacity={0.7}
          >
            <Text style={styles.calculateButtonText}>計算する</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>電線断面積計算について</Text>
          <Text style={styles.infoText}>
            電線の断面積は電気設備の安全性を確保するために重要です。適切な断面積を持つ電線を使用することで、過熱や火災のリスクを低減できます。
            電圧降下を許容値内に抑えるために必要な最小断面積を計算できます。
          </Text>
          
          <View style={{marginTop: 12}}>
            <Text style={[styles.infoText, {fontWeight: 'bold', marginBottom: 6}]}>変数の説明:</Text>
            <View style={styles.variableRow}>
              <Text style={styles.variableSymbol}>S</Text>
              <Text style={styles.variableDesc}>:電線の断面積 (mm²)</Text>
            </View>
            <View style={styles.variableRow}>
              <Text style={styles.variableSymbol}>L</Text>
              <Text style={styles.variableDesc}>:電線の長さ (m)</Text>
            </View>
            <View style={styles.variableRow}>
              <Text style={styles.variableSymbol}>I</Text>
              <Text style={styles.variableDesc}>:電流 (A)</Text>
            </View>
            <View style={styles.variableRow}>
              <Text style={styles.variableSymbol}>e</Text>
              <Text style={styles.variableDesc}>:各線間の電圧降下 (V)</Text>
            </View>
            <View style={styles.variableRow}>
              <Text style={styles.variableSymbol}>e'</Text>
              <Text style={styles.variableDesc}>:外側線または各相の1線と中性線との間の電圧降下 (V)</Text>
            </View>
          </View>
        </View> */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 