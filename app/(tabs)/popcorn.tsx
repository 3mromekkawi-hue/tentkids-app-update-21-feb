import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp, Notification } from '@/contexts/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FallingSweets } from '@/components/FallingSweets';

function NotifItem({ item, index }: { item: Notification; index: number }) {
  const { language, isRTL, markNotificationRead } = useApp();
  const title = language === 'ar' ? item.titleAr : item.titleEn;
  const message = language === 'ar' ? item.messageAr : item.messageEn;

  const iconMap: Record<string, { name: string; color: string }> = {
    reaction: { name: 'heart', color: Colors.danger },
    comment: { name: 'chatbubble', color: Colors.accent },
    friend_request: { name: 'person-add', color: Colors.purple },
    friend_accepted: { name: 'people', color: Colors.success },
    system: { name: 'notifications', color: Colors.primary },
  };
  const ic = iconMap[item.type] || iconMap.system;
  const timeAgo = getTimeAgo(item.createdAt);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Pressable
        style={[styles.notifCard, !item.read && styles.notifUnread, isRTL && { flexDirection: 'row-reverse' }]}
        onPress={() => { if (!item.read) { markNotificationRead(item.id); if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
      >
        <View style={[styles.notifIcon, { backgroundColor: ic.color + '18' }]}>
          <Ionicons name={ic.name as any} size={22} color={ic.color} />
        </View>
        <View style={[styles.notifContent, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.notifTitle, isRTL && styles.rtl]}>{title}</Text>
          <Text style={[styles.notifMsg, isRTL && styles.rtl]} numberOfLines={2}>{message}</Text>
          <Text style={[styles.notifTime, isRTL && styles.rtl]}>{timeAgo}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </Pressable>
    </Animated.View>
  );
}

function getTimeAgo(ts: number) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
export default function PopcornScreen() {
  const { t, isRTL, notifications } = useApp();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [showSweets, setShowSweets] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSweets(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={[Colors.background, '#FFF0E0', '#FFE4F0', Colors.background]} style={styles.container}>
      {showSweets && <FallingSweets count={16} />}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 8 }]}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <MaterialCommunityIcons name="popcorn" size={28} color={Colors.secondary} />
          <Text style={[styles.title, isRTL && styles.rtl]}>{t('popcorn')}</Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <NotifItem item={item} index={index} />}
        contentContainerStyle={[styles.list, { paddingBottom: 100 }, notifications.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="popcorn" size={64} color={Colors.textMuted} />
            <Text style={[styles.emptyTitle, isRTL && styles.rtl]}>{t('noNotifications')}</Text>
            <Text style={[styles.emptySub, isRTL && styles.rtl]}>{t('allCaughtUp')}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '700' as const, color: Colors.text },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  list: { padding: 16 },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary },
  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceGlass, borderRadius: 18, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  notifUnread: { backgroundColor: 'rgba(255,107,138,0.06)' },
  notifIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  notifMsg: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
});
