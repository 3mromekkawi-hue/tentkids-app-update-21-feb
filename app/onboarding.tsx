import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '../context/AuthContext';
import { avatars, tentColors } from '@/constants/avatars';
import { Avatar } from '@/components/Avatar';
import { FallingSweets } from '@/components/FallingSweets';

export default function Onboarding() {
  const { t, isRTL, language, setProfile, setIsOnboarded } = useApp();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState<'animals' | 'sweets' | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState('bear');
  const [selectedColor, setSelectedColor] = useState('cream');

  const filteredAvatars = category ? avatars.filter(a => a.category === category && !a.premium) : [];

  const handleNext = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    if (!session) {
      // Block onboarding completion if not signed up
      router.replace('/SignupScreen');
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const tc = tentColors.find(c => c.id === selectedColor);
    await setProfile({
      id: session.user.id,
      nickname: nickname.trim() || (language === 'ar' ? 'طفل' : 'Kid'),
      avatarId: selectedAvatar,
      tentColor: tc?.color || '#FFF3E0',
      tentGlow: tc?.glow || '#FFE0B2',
      status: '',
      friendCount: 0,
      createdAt: Date.now(),
    });
    await setIsOnboarded(true);
    router.replace('/(tabs)/cookies');
  };

  const canProceed = step === 0 ? nickname.trim().length >= 2
    : step === 1 ? category !== null
    : true;

  return (
    <LinearGradient colors={[Colors.background, '#FFE4F0', '#F0E4FF']} style={styles.container}>
      <FallingSweets count={10} />
      <View style={[styles.inner, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 12 }]}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          {step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} hitSlop={8}>
              <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={28} color={Colors.text} />
            </Pressable>
          ) : <View style={{ width: 28 }} />}
          <View style={styles.dots}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
            ))}
          </View>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContent}>
              <MaterialCommunityIcons name="tent" size={56} color={Colors.primary} />
              <Text style={[styles.stepTitle, isRTL && styles.rtl]}>{t('createProfile')}</Text>
              <Text style={[styles.stepSub, isRTL && styles.rtl]}>{t('enterNickname')}</Text>
              <TextInput
                style={[styles.input, isRTL && styles.rtl]}
                value={nickname} onChangeText={setNickname}
                placeholder={t('nickname')} placeholderTextColor={Colors.textMuted}
                maxLength={20} textAlign={isRTL ? 'right' : 'left'} autoFocus
              />
            </Animated.View>
          )}

          {step === 1 && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContent}>
              <Text style={[styles.stepTitle, isRTL && styles.rtl]}>{t('chooseCategory')}</Text>
              <View style={styles.categoryRow}>
                <Pressable
                  style={[styles.categoryCard, category === 'animals' && styles.categoryCardActive]}
                  onPress={() => { setCategory('animals'); if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
                >
                  <MaterialCommunityIcons name="paw" size={40} color={category === 'animals' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.categoryLabel, category === 'animals' && { color: Colors.primary }]}>{t('animals')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.categoryCard, category === 'sweets' && styles.categoryCardActive]}
                  onPress={() => { setCategory('sweets'); if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
                >
                  <MaterialCommunityIcons name="candy" size={40} color={category === 'sweets' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.categoryLabel, category === 'sweets' && { color: Colors.primary }]}>{t('sweets')}</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContent}>
              <Text style={[styles.stepTitle, isRTL && styles.rtl]}>{t('chooseAvatar')}</Text>
              <View style={styles.grid}>
                {filteredAvatars.map(a => (
                  <Pressable key={a.id} onPress={() => { setSelectedAvatar(a.id); if (Platform.OS !== 'web') Haptics.selectionAsync(); }} style={styles.gridItem}>
                    <Avatar avatarId={a.id} size={64} selected={selectedAvatar === a.id} />
                    <Text style={[styles.gridLabel, isRTL && styles.rtl]}>{language === 'ar' ? a.nameAr : a.nameEn}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContent}>
              <Text style={[styles.stepTitle, isRTL && styles.rtl]}>{t('chooseTentColor')}</Text>
              <View style={styles.colorGrid}>
                {tentColors.map(c => (
                  <Pressable key={c.id} onPress={() => { setSelectedColor(c.id); if (Platform.OS !== 'web') Haptics.selectionAsync(); }} style={styles.colorItem}>
                    <View style={[styles.colorOuter, selectedColor === c.id && { borderColor: Colors.primary, borderWidth: 3 }]}>
                      <View style={[styles.colorInner, { backgroundColor: c.color }]}>
                        <View style={[styles.colorGlow, { backgroundColor: c.glow }]} />
                      </View>
                    </View>
                    <Text style={[styles.gridLabel, isRTL && styles.rtl]}>{language === 'ar' ? c.name_ar : c.name_en}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        <Pressable style={[styles.nextBtn, !canProceed && styles.nextBtnOff]} onPress={handleNext} disabled={!canProceed}>
          <LinearGradient colors={canProceed ? ['#FF6B8A', '#FF8E53'] : ['#ccc', '#ccc']} style={styles.nextBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.nextBtnText}>{step === 3 ? t('letsGetStarted') : t('next')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  headerRTL: { flexDirection: 'row-reverse' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  dotDone: { backgroundColor: Colors.success },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  stepContent: { alignItems: 'center', paddingTop: 28, gap: 16 },
  stepTitle: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, textAlign: 'center' },
  stepSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  input: {
    width: '100%', backgroundColor: Colors.surfaceGlass, borderRadius: 18,
    paddingHorizontal: 20, paddingVertical: 16, fontSize: 18, color: Colors.text,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
  },
  categoryRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  categoryCard: {
    flex: 1, backgroundColor: Colors.surfaceGlass, borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 10, borderWidth: 2, borderColor: 'transparent',
  },
  categoryCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,107,138,0.08)' },
  categoryLabel: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 8 },
  gridItem: { alignItems: 'center', gap: 6, width: 80 },
  gridLabel: { fontSize: 12, color: Colors.textSecondary },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 8 },
  colorItem: { alignItems: 'center', gap: 6, width: 80 },
  colorOuter: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'transparent', padding: 3 },
  colorInner: { flex: 1, borderRadius: 28, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  colorGlow: { width: 20, height: 20, borderRadius: 10, opacity: 0.6 },
  nextBtn: { borderRadius: 22, overflow: 'hidden', marginTop: 12 },
  nextBtnOff: { opacity: 0.5 },
  nextBtnGrad: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 22 },
  nextBtnText: { fontSize: 17, fontWeight: '700' as const, color: '#fff' },
});
