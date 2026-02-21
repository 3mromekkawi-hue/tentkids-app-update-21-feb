import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { legalTextAr, legalTextEn } from '@/constants/legalText';

export default function TermsScreen() {
  const { t, isRTL, language, setHasAgreedTerms } = useApp();
  const insets = useSafeAreaInsets();
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 60;
    if (isEnd) setScrolledToEnd(true);
  };

  const handleAgree = async () => {
    await setHasAgreedTerms(true);
    router.replace('/onboarding');
  };

  const legalText = language === 'ar' ? legalTextAr : legalTextEn;
  const canAgree = scrolledToEnd && checked;

  return (
    <LinearGradient colors={[Colors.background, '#FFE4F0', Colors.background]} style={styles.container}>
      <View style={[styles.inner, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 12 }]}>
        <Text style={[styles.title, isRTL && styles.rtl]}>{t('termsTitle')}</Text>

        <View style={styles.scrollContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            showsVerticalScrollIndicator
          >
            <Text style={[styles.legalText, isRTL && styles.rtl]}>{legalText}</Text>
          </ScrollView>
        </View>

        {!scrolledToEnd && (
          <View style={styles.scrollHint}>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            <Text style={styles.scrollHintText}>{isRTL ? 'مرر للأسفل' : 'Scroll to read all'}</Text>
          </View>
        )}

        <Pressable style={[styles.checkRow, isRTL && styles.checkRowRTL]} onPress={() => scrolledToEnd && setChecked(!checked)} disabled={!scrolledToEnd}>
          <View style={[styles.checkbox, checked && styles.checkboxChecked, !scrolledToEnd && styles.checkboxDisabled]}>
            {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[styles.checkLabel, isRTL && styles.rtl, !scrolledToEnd && { opacity: 0.4 }]}>{t('termsCheck')}</Text>
        </Pressable>

        <Pressable
          style={[styles.agreeBtn, !canAgree && styles.agreeBtnDisabled]}
          onPress={handleAgree}
          disabled={!canAgree}
        >
          <LinearGradient colors={canAgree ? ['#FF6B8A', '#FF8E53'] : ['#ccc', '#ccc']} style={styles.agreeBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.agreeBtnText}>{t('agree')}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, textAlign: 'center' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  legalText: { fontSize: 14, color: Colors.text, lineHeight: 24 },
  scrollHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  scrollHintText: { fontSize: 12, color: Colors.textSecondary },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  checkRowRTL: { flexDirection: 'row-reverse' },
  checkbox: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.textMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxDisabled: { opacity: 0.4 },
  checkLabel: { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 20 },
  agreeBtn: { borderRadius: 20, overflow: 'hidden' },
  agreeBtnDisabled: { opacity: 0.6 },
  agreeBtnGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 20 },
  agreeBtnText: { fontSize: 17, fontWeight: '700' as const, color: '#fff' },
});
