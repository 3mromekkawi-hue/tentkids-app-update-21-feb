import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '@/components/Avatar';
import { avatars, tentColors } from '@/constants/avatars';
import { FallingSweets } from '@/components/FallingSweets';

export default function MyTent() {
  const { t, isRTL, language, profile, updateProfile, signOut } = useApp();
  const { session } = useAuth();
  if (!session) return null;
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [nick, setNick] = useState(profile?.nickname || '');
  const [status, setStatus] = useState(profile?.status || '');
  const [selAvatar, setSelAvatar] = useState(profile?.avatarId || 'bear');
  const [selColor, setSelColor] = useState(tentColors.find(c => c.color === profile?.tentColor)?.id || 'cream');
  const [showSweets, setShowSweets] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSweets(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    const tc = tentColors.find(c => c.id === selColor);
    updateProfile({
      nickname: nick.trim() || profile?.nickname || 'Kid',
      avatarId: selAvatar,
      tentColor: tc?.color || profile?.tentColor || '#FFF3E0',
      tentGlow: tc?.glow || profile?.tentGlow || '#FFE0B2',
      status,
    });
    setEditing(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSignOut = () => {
    Alert.alert(t('signOut'), t('signOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('signOut'), style: 'destructive', onPress: async () => { await signOut(); router.replace('/language-select'); } },
    ]);
  };

  if (!profile) return null;

  const tc = tentColors.find(c => c.id === selColor) || tentColors[0];

  return (
    <LinearGradient colors={[profile.tentColor, profile.tentGlow, '#FFF0F5']} style={styles.container}>
      {showSweets && <FallingSweets count={14} />}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, {
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 8,
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20,
        }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}> 
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={28} color={Colors.text} />
          </Pressable>
          <Text style={[styles.title, isRTL && styles.rtl]}>{t('myTent')}</Text>
          <Pressable onPress={() => editing ? handleSave() : setEditing(true)} hitSlop={8}>
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={24} color={Colors.primary} />
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(400)} style={styles.profileSection}>
          <View style={[styles.tentGlow, { backgroundColor: profile.tentGlow + '40' }]} />
          <Avatar avatarId={editing ? selAvatar : profile.avatarId} size={90} />
          {!editing ? (
            <>
              <Text style={[styles.nickname, isRTL && styles.rtl]}>{profile.nickname}</Text>
              {profile.status ? <Text style={[styles.statusText, isRTL && styles.rtl]}>{profile.status}</Text> : null}
              <Text style={styles.friendInfo}>{profile.friendCount} {t('friends')}</Text>
            </>
          ) : (
            <View style={styles.editSection}>
              <TextInput style={[styles.input, isRTL && styles.rtl]} value={nick} onChangeText={setNick}
                placeholder={t('nickname')} placeholderTextColor={Colors.textMuted}
                textAlign={isRTL ? 'right' : 'left'} maxLength={20} />
              <TextInput style={[styles.input, isRTL && styles.rtl]} value={status} onChangeText={setStatus}
                placeholder={t('enterStatus')} placeholderTextColor={Colors.textMuted}
                textAlign={isRTL ? 'right' : 'left'} maxLength={60} />
            </View>
          )}
        </Animated.View>

        {editing && (
          <>
            <Text style={[styles.sectionLabel, isRTL && styles.rtl]}>{t('chooseAvatar')}</Text>
            <View style={styles.grid}>
              {avatars.filter(a => !a.premium).map(a => (
                <Pressable key={a.id} onPress={() => { setSelAvatar(a.id); if (Platform.OS !== 'web') Haptics.selectionAsync(); }}>
                  <Avatar avatarId={a.id} size={52} selected={selAvatar === a.id} />
                </Pressable>
              ))}
            </View>
            <Text style={[styles.sectionLabel, isRTL && styles.rtl]}>{t('chooseTentColor')}</Text>
            <View style={styles.colorRow}>
              {tentColors.map(c => (
                <Pressable key={c.id} onPress={() => { setSelColor(c.id); if (Platform.OS !== 'web') Haptics.selectionAsync(); }}>
                  <View style={[styles.colorDot, { backgroundColor: c.color }, selColor === c.id && styles.colorDotSel]} />
                </Pressable>
              ))}
            </View>
          </>
        )}

        <View style={styles.tentDecor}>
          <MaterialCommunityIcons name="tent" size={48} color={profile.tentGlow} />
        </View>

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
          <Text style={[styles.signOutText, isRTL && styles.rtl]}>{t('signOut')}</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '700' as const, color: Colors.text },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  profileSection: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  tentGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, top: 0 },
  nickname: { fontSize: 26, fontWeight: '700' as const, color: Colors.text },
  statusText: { fontSize: 15, color: Colors.textSecondary },
  friendInfo: { fontSize: 13, color: Colors.textMuted },
  editSection: { width: '100%', gap: 10, marginTop: 8 },
  input: {
    backgroundColor: Colors.surfaceGlass, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  sectionLabel: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  colorRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  colorDot: { width: 40, height: 40, borderRadius: 20 },
  colorDotSel: { borderWidth: 3, borderColor: Colors.text },
  tentDecor: { alignItems: 'center', marginVertical: 12 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,107,107,0.08)', paddingVertical: 14, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)',
  },
  signOutText: { fontSize: 16, fontWeight: '600' as const, color: Colors.danger },
});
