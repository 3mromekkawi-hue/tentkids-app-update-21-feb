
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '@/components/Avatar';
import { ParentGate } from '@/components/ParentGate';
import { FallingSweets } from '@/components/FallingSweets';
import { avatars } from '@/constants/avatars';

export default function Friends() {
  const { t, isRTL, friends, sendFriendRequest, acceptFriend, rejectFriend } = useApp();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [showGate, setShowGate] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');
  const [showSweets, setShowSweets] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSweets(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const accepted = friends.filter(f => f.status === 'accepted');
  const pending = friends.filter(f => f.status === 'pending');

  const handleSend = () => {
    if (!name.trim()) return;
    const ra = avatars.filter(a => !a.premium);
    const av = ra[Math.floor(Math.random() * ra.length)];
    sendFriendRequest(name.trim(), av.id);
    setName(''); setAdding(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
  };

  return (
    <LinearGradient colors={[Colors.background, '#F0E4FF', '#FFE4F0', Colors.background]} style={styles.container}>
      {showSweets && <FallingSweets count={12} />}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 8 }]}> 
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}> 
          <Text style={[styles.title, isRTL && styles.rtl]}>{t('friends')}</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowGate(true)}>
            <Ionicons name="person-add" size={22} color={Colors.primary} />
          </Pressable>
        </View>
        <View style={[styles.tabRow, isRTL && { flexDirection: 'row-reverse' }]}> 
          <Pressable style={[styles.tabBtn, tab === 'friends' && styles.tabActive]} onPress={() => setTab('friends')}>
            <Text style={[styles.tabText, tab === 'friends' && styles.tabTextActive]}>{t('myFriends')} ({accepted.length})</Text>
          </Pressable>
          <Pressable style={[styles.tabBtn, tab === 'requests' && styles.tabActive]} onPress={() => setTab('requests')}>
            <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>{t('friendRequests')} ({pending.length})</Text>
          </Pressable>
        </View>
      </View>

      {adding && (
        <View style={[styles.addSection, isRTL && { flexDirection: 'row-reverse' }]}> 
          <TextInput style={[styles.addInput, isRTL && styles.rtl]} value={name} onChangeText={setName}
            placeholder={t('searchFriends')} placeholderTextColor={Colors.textMuted}
            textAlign={isRTL ? 'right' : 'left'} autoFocus />
          <Pressable style={[styles.sendBtn, !name.trim() && { opacity: 0.5 }]} onPress={handleSend} disabled={!name.trim()}>
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      )}

      <FlatList
        data={tab === 'friends' ? accepted : pending}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            <View style={[styles.friendCard, isRTL && { flexDirection: 'row-reverse' }]}> 
              <Avatar avatarId={item.fromAvatarId} size={48} />
              <View style={[styles.friendInfo, isRTL && { alignItems: 'flex-end' }]}> 
                <Text style={[styles.friendName, isRTL && styles.rtl]}>{item.fromNickname}</Text>
                {item.status === 'pending' && (
                  <View style={[styles.reqActions, isRTL && { flexDirection: 'row-reverse' }]}> 
                    <Pressable style={styles.acceptBtn} onPress={() => acceptFriend(item.id)}>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    </Pressable>
                    <Pressable style={styles.rejectBtn} onPress={() => rejectFriend(item.id)}>
                      <Ionicons name="close" size={18} color="#fff" />
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 100 }, (tab === 'friends' ? accepted : pending).length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color={Colors.textMuted} />
            <Text style={[styles.emptyTitle, isRTL && styles.rtl]}>{t('noFriendsYet')}</Text>
            <Text style={[styles.emptySub, isRTL && styles.rtl]}>{t('findFriends')}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      <ParentGate visible={showGate} onSuccess={() => { setShowGate(false); setAdding(true); }} onClose={() => setShowGate(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700' as const, color: Colors.text },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceGlass, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  tabRow: { flexDirection: 'row', gap: 8 },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: Colors.surfaceGlass },
  tabActive: { backgroundColor: 'rgba(255,107,138,0.12)' },
  tabText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' as const },
  tabTextActive: { color: Colors.primary, fontWeight: '600' as const },
  addSection: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
  addInput: { flex: 1, backgroundColor: Colors.surfaceGlass, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary },
  friendCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceGlass, borderRadius: 18, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  reqActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  acceptBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.danger, justifyContent: 'center', alignItems: 'center' },
});
