import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { FallingSweets } from '@/components/FallingSweets';

type Mode = 'menu' | 'post' | 'story';

const STORY_COLORS = ['#FF6B8A', '#B388FF', '#4FC3F7', '#FFB347', '#66BB6A', '#FF80AB', '#7C4DFF', '#FF7043'];
const STORY_ICONS = ['star-four-points', 'heart', 'candy', 'cupcake', 'tent', 'ice-cream', 'cookie', 'cake-variant'];

export default function AddScreen() {
  const { t, isRTL, addPost, addStory } = useApp();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('menu');
  const [postContent, setPostContent] = useState('');
  const [selectedStoryColor, setSelectedStoryColor] = useState(STORY_COLORS[0]);
  const [selectedStoryIcon, setSelectedStoryIcon] = useState(STORY_ICONS[0]);
  const [showSweets, setShowSweets] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSweets(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handlePost = () => {
    if (!postContent.trim()) return;
    addPost(postContent);
    setPostContent('');
    setMode('menu');
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleStory = () => {
    addStory(selectedStoryColor, selectedStoryIcon);
    setMode('menu');
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t('done'));
  };

  return (
    <LinearGradient colors={[Colors.background, '#FFE4F0', '#F0E4FF', Colors.background]} style={styles.container}>
      {showSweets && <FallingSweets count={14} />}
      <View style={[styles.inner, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 8, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) }]}>
        {mode === 'menu' && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.menuContent}>
            <View style={styles.glowOrb}>
              <Ionicons name="add" size={48} color="#fff" />
            </View>
            <Text style={[styles.menuTitle, isRTL && styles.rtl]}>{t('createPost')}</Text>

            <Pressable style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnP]} onPress={() => setMode('post')}>
              <LinearGradient colors={['#FF6B8A', '#FF8E53']} style={styles.menuBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialCommunityIcons name="pencil-plus" size={24} color="#fff" />
                <Text style={styles.menuBtnText}>{t('newPost')}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnP]} onPress={() => setMode('story')}>
              <LinearGradient colors={['#7C4DFF', '#B388FF']} style={styles.menuBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialCommunityIcons name="star-circle" size={24} color="#fff" />
                <Text style={styles.menuBtnText}>{t('newStory')}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {mode === 'post' && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Animated.View entering={FadeInDown.duration(400)} style={styles.formContent}>
                <View style={[styles.formHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Pressable onPress={() => setMode('menu')}>
                    <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={28} color={Colors.text} />
                  </Pressable>
                  <Text style={[styles.formTitle, isRTL && styles.rtl]}>{t('newPost')}</Text>
                  <View style={{ width: 28 }} />
                </View>
                <TextInput
                  style={[styles.postInput, isRTL && styles.rtl]}
                  value={postContent} onChangeText={setPostContent}
                  placeholder={t('writePost')} placeholderTextColor={Colors.textMuted}
                  multiline maxLength={500} textAlignVertical="top"
                  textAlign={isRTL ? 'right' : 'left'} autoFocus
                />
                <Text style={styles.charCount}>{postContent.length}/500</Text>
                <Pressable style={[styles.submitBtn, !postContent.trim() && styles.submitOff]} onPress={handlePost} disabled={!postContent.trim()}>
                  <LinearGradient colors={postContent.trim() ? ['#FF6B8A', '#FF8E53'] : ['#ccc', '#ccc']} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.submitText}>{t('share')}</Text>
                    <Ionicons name="send" size={18} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {mode === 'story' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.formContent}>
              <View style={[styles.formHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                <Pressable onPress={() => setMode('menu')}>
                  <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={28} color={Colors.text} />
                </Pressable>
                <Text style={[styles.formTitle, isRTL && styles.rtl]}>{t('newStory')}</Text>
                <View style={{ width: 28 }} />
              </View>

              <View style={[styles.storyPreview, { backgroundColor: selectedStoryColor }]}>
                <MaterialCommunityIcons name={selectedStoryIcon as any} size={64} color="rgba(255,255,255,0.9)" />
              </View>

              <Text style={[styles.pickLabel, isRTL && styles.rtl]}>{t('chooseTentColor')}</Text>
              <View style={styles.colorRow}>
                {STORY_COLORS.map(c => (
                  <Pressable key={c} onPress={() => { setSelectedStoryColor(c); if (Platform.OS !== 'web') Haptics.selectionAsync(); }}>
                    <View style={[styles.colorDot, { backgroundColor: c }, selectedStoryColor === c && styles.colorDotSel]} />
                  </Pressable>
                ))}
              </View>

              <View style={styles.iconRow}>
                {STORY_ICONS.map(ic => (
                  <Pressable key={ic} onPress={() => { setSelectedStoryIcon(ic); if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
                    style={[styles.iconBtn, selectedStoryIcon === ic && styles.iconBtnSel]}>
                    <MaterialCommunityIcons name={ic as any} size={24} color={selectedStoryIcon === ic ? Colors.primary : Colors.textSecondary} />
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.submitBtn} onPress={handleStory}>
                <LinearGradient colors={['#7C4DFF', '#B388FF']} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.submitText}>{t('share')}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 20 },
  menuContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  glowOrb: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  menuTitle: { fontSize: 22, fontWeight: '700' as const, color: Colors.text },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  menuBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  menuBtnP: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  menuBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 20 },
  menuBtnText: { fontSize: 17, fontWeight: '700' as const, color: '#fff' },
  formContent: { gap: 16, paddingTop: 8 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  postInput: {
    backgroundColor: Colors.surfaceGlass, borderRadius: 18, padding: 16,
    fontSize: 16, color: Colors.text, minHeight: 160, lineHeight: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  charCount: { fontSize: 12, color: Colors.textMuted, textAlign: 'right' },
  submitBtn: { borderRadius: 20, overflow: 'hidden' },
  submitOff: { opacity: 0.5 },
  submitGrad: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 20 },
  submitText: { fontSize: 16, fontWeight: '700' as const, color: '#fff' },
  storyPreview: { height: 200, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  pickLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  colorRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotSel: { borderWidth: 3, borderColor: Colors.text },
  iconRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  iconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.surfaceGlass, justifyContent: 'center', alignItems: 'center' },
  iconBtnSel: { backgroundColor: 'rgba(255,107,138,0.12)', borderWidth: 1, borderColor: Colors.primary },
});
