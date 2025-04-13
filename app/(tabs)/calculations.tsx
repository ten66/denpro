import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, ScrollView } from 'react-native';
import { useTheme } from '../_layout';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CalculationsScreen() {
  const { isDarkMode } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      color: isDarkMode ? '#fff' : '#000',
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
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: isDarkMode ? '#fff' : '#000',
    },
    cardDescription: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#666',
      marginBottom: 12,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    linkText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isDarkMode ? '#4dabf7' : '#0070f3',
      marginRight: 4,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>電気工事士計算</Text>
      
      <Link href="/calculations/voltage-drop" asChild>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>電圧降下計算</Text>
          <Text style={styles.cardDescription}>
            電線の長さ、電流、電線サイズに基づいて電圧降下を計算します。
          </Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>計算する</Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#4dabf7' : '#0070f3'} />
          </View>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
} 