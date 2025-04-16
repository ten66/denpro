import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../_layout';

export default function DisclaimerScreen() {
  const { isDarkMode } = useTheme();
  
  const handleOpenContactForm = () => {
    const url = 'https://forms.gle/chswttw68dP9XPuR7';
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('エラー', 'リンクを開けませんでした');
      }
    });
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#121212' : '#F2F2F7' }
    ]}>
      <Stack.Screen
        options={{
          title: '免責事項',
          headerStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
          },
          headerTintColor: isDarkMode ? '#FFFFFF' : '#000000',
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[
            styles.disclaimerText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            当コンテンツ・情報におきましては、正確かつ最新の情報を掲載するよう細心の注意を払っておりますが、内容の正確性・安全性・有用性等を保証するものではありません。予告なく情報の修正・削除を行うこともございます。
          </Text>
          
          <Text style={[
            styles.disclaimerText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' },
            styles.paragraph
          ]}>
            万が一、本コンテンツの情報に基づいて生じたトラブルや損害等につきましては、一切の責任を負いかねますので、あらかじめご了承ください。
          </Text>
          
          <View style={styles.paragraph}>
            <Text style={[
              styles.disclaimerText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              内容に関してご不明な点やお気づきの点がございましたら、
            </Text>
            <TouchableOpacity onPress={handleOpenContactForm}>
              <Text style={[
                styles.disclaimerText,
                styles.linkText,
                { color: isDarkMode ? '#4dabf7' : '#0070f3' }
              ]}>
                お問い合わせフォーム
              </Text>
            </TouchableOpacity>
            <Text style={[
              styles.disclaimerText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              よりお問い合わせいただけますと幸いです。より良い情報提供のため、ご協力をよろしくお願いいたします。
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 16,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  }
}); 