import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const { width: SW } = Dimensions.get('window');

function FloatingDecor({ icon, color, left, top, delay }: { icon: string; color: string; left: number; top: number; delay: number }) {
  const y = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withSequence(
      withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      withTiming(12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
    ), -1, true));
    rot.value = withDelay(delay, withRepeat(withSequence(
      withTiming(-10, { duration: 3000 }),
      withTiming(10, { duration: 3000 }),
    ), -1, true));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left, top }, animStyle]}>
      <MaterialCommunityIcons name={icon as any} size={22} color={color} />
    </Animated.View>
  );
}

export default function LanguageSelectScreen() {
  const { setLanguage } = useApp();
  const insets = useSafeAreaInsets();

  const tentScale = useSharedValue(0.8);
  const tentOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    tentOpacity.value = withTiming(1, { duration: 1200 });
    tentScale.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.back(1.2)) });
    glowOpacity.value = withDelay(800, withRepeat(withSequence(
      withTiming(0.6, { duration: 2000 }),
      withTiming(0.3, { duration: 2000 }),
    ), -1, true));
  }, []);

  const tentAnim = useAnimatedStyle(() => ({
    transform: [{ scale: tentScale.value }],
    opacity: tentOpacity.value,
  }));

  const glowAnim = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const selectLang = async (lang: 'ar' | 'en') => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setLanguage(lang);
    router.replace('/terms');
  };

  return (
    <LinearGradient colors={[Colors.nightSky, '#1A1040', '#281850']} style={styles.container}>
      <FloatingDecor icon="candy" color="rgba(248,187,208,0.4)" left={SW * 0.1} top={120} delay={0} />
      <FloatingDecor icon="cupcake" color="rgba(206,147,216,0.4)" left={SW * 0.75} top={180} delay={400} />
      <FloatingDecor icon="star-four-points" color="rgba(255,213,79,0.35)" left={SW * 0.5} top={80} delay={800} />
      <FloatingDecor icon="ice-cream" color="rgba(129,212,250,0.4)" left={SW * 0.2} top={280} delay={200} />
      <FloatingDecor icon="cookie" color="rgba(255,171,145,0.35)" left={SW * 0.8} top={320} delay={600} />

      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 40, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }]}>
        <Animated.View style={[styles.tentContainer, tentAnim]}>
          <Animated.View style={[styles.glowCircle, glowAnim]} />
          <MaterialCommunityIcons name="tent" size={100} color={Colors.tentGold} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(700)} style={styles.titleSection}>
          <Text style={styles.title}>Tent-Kids</Text>
          <Text style={styles.titleAr}>خيمة الأطفال</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(900).duration(600)}>
          <Text style={styles.subtitleText}>Choose your language / اختر لغتك</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1100).duration(700)} style={styles.buttonsContainer}>
          <Pressable style={({ pressed }) => [styles.langBtn, pressed && styles.langBtnPressed]} onPress={() => selectLang('ar')}>
            <LinearGradient colors={['#FF6B8A', '#FF8E53']} style={styles.langBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.langBtnText}>العربية (مصر)</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.langBtn, pressed && styles.langBtnPressed]} onPress={() => selectLang('en')}>
            <LinearGradient colors={['#7C4DFF', '#B388FF']} style={styles.langBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.langBtnText}>English</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 28 },
  tentContainer: { alignItems: 'center', justifyContent: 'center', width: 160, height: 160 },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,213,79,0.15)',
  },
  titleSection: { alignItems: 'center', gap: 2 },
  title: { fontSize: 38, fontWeight: '800' as const, color: '#fff', letterSpacing: 1 },
  titleAr: { fontSize: 30, fontWeight: '700' as const, color: Colors.tentGold },
  subtitleText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  buttonsContainer: { width: '100%', gap: 14, marginTop: 8 },
  langBtn: { borderRadius: 22, overflow: 'hidden' },
  langBtnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  langBtnGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: 22 },
  langBtnText: { fontSize: 20, fontWeight: '700' as const, color: '#fff' },
});
