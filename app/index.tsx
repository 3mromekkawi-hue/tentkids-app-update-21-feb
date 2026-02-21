import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function IndexScreen() {
  const { isLoading, isOnboarded, hasAgreedTerms } = useApp();

  useEffect(() => {
    if (!isLoading) {
      if (isOnboarded && hasAgreedTerms) {
        router.replace('/(tabs)/cookies');
      } else {
        router.replace('/language-select');
      }
    }
  }, [isLoading, isOnboarded, hasAgreedTerms]);

  return (
    <LinearGradient colors={[Colors.nightSky, '#1E1040', '#2A1050']} style={styles.container}>
      <ActivityIndicator size="large" color={Colors.tentGold} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
