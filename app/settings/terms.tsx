import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../_layout';

export default function TermsScreen() {
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
          title: '利用規約',
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
            styles.headerText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            利用規約
          </Text>
          
          <Text style={[
            styles.termsText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' },
            styles.paragraph
          ]}>
            この利用規約（以下、「本規約」といいます。）は、電プロアプリ（以下、「本アプリ」といいます。）の利用条件を定めるものです。ユーザーの皆様（以下、「ユーザー」といいます。）には、本規約に従って本アプリをご利用いただきます。
          </Text>
          
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            第1条（適用）
          </Text>
          <Text style={[
            styles.termsText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            本規約は、ユーザーと当方との間の本アプリの利用に関わる一切の関係に適用されるものとします。
          </Text>
          
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            第2条（禁止事項）
          </Text>
          <Text style={[
            styles.termsText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            ユーザーは、本アプリの利用にあたり、以下の行為をしてはなりません。
          </Text>
          <Text style={[
            styles.termsText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            (1) 法令または公序良俗に違反する行為{'\n'}
            (2) 犯罪行為に関連する行為{'\n'}
            (3) 本アプリの運営を妨害するおそれのある行為{'\n'}
            (4) 他のユーザーに関する個人情報等を収集または蓄積する行為{'\n'}
            (5) 他のユーザーに成りすます行為{'\n'}
            (6) 当方のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為{'\n'}
            (7) その他、当方が不適切と判断する行為
          </Text>
          
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            第3条（保証の否認および免責事項）
          </Text>
          <Text style={[
            styles.termsText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            当方は、本アプリに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
          </Text>
          <Text style={[
            styles.termsText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            当方は、本アプリに起因してユーザーに生じたあらゆる損害について、当方の故意又は重過失による場合を除き、一切の責任を負いません。
          </Text>
          
          <View style={styles.paragraph}>
            <Text style={[
              styles.termsText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              本規約に関して不明な点やお問い合わせは、
            </Text>
            <TouchableOpacity onPress={handleOpenContactForm}>
              <Text style={[
                styles.termsText,
                styles.linkText,
                { color: isDarkMode ? '#4dabf7' : '#0070f3' }
              ]}>
                お問い合わせフォーム
              </Text>
            </TouchableOpacity>
            <Text style={[
              styles.termsText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              よりご連絡ください。
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
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 20,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  }
}); 