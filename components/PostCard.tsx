import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/Avatar';
import { useApp, Post } from '@/contexts/AppContext';

const REACTIONS = ['heart', 'star', 'thumb-up', 'emoticon-happy', 'fire'];
const SAFE_COMMENT_KEYS = ['safeComment1', 'safeComment2', 'safeComment3', 'safeComment4', 'safeComment5', 'safeComment6', 'safeComment7', 'safeComment8'];

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { t, isRTL, profile, reactToPost, addSafeComment, reportPost } = useApp();
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const player = post.videoUrl ? useVideoPlayer(post.videoUrl) : null;

  const bounceScale = useSharedValue(1);
  const bounceAnim = useAnimatedStyle(() => ({ transform: [{ scale: bounceScale.value }] }));

  const handleReaction = (emoji: string) => {
    bounceScale.value = withSequence(withSpring(1.3), withSpring(1));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reactToPost(post.id, emoji);
    setShowReactions(false);
  };

  const handleSafeComment = (key: string) => {
    addSafeComment(post.id, key);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleReport = () => {
    Alert.alert(t('report'), t('reportContent'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('report'), style: 'destructive', onPress: () => reportPost(post.id) },
    ]);
  };

  const timeAgo = getTimeAgo(post.createdAt);
  if (post.reported) return null;

  return (
    <View style={styles.card}>
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <Avatar avatarId={post.authorAvatarId} size={42} />
        <View style={[styles.headerInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.nick, isRTL && styles.rtl]}>{post.authorNickname}</Text>
          <Text style={[styles.time, isRTL && styles.rtl]}>{timeAgo}</Text>
        </View>
        <Pressable onPress={handleReport} hitSlop={10}>
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
        </Pressable>
      </View>

      {post.content ? <Text style={[styles.content, isRTL && styles.rtl]}>{post.content}</Text> : null}

      {post.videoUrl && (
        <View style={styles.videoContainer}>
          <Pressable style={{ width: '100%', height: '100%' }} onPress={() => {}}>
            {player ? (
              <VideoView
                player={player}
                style={styles.video}
                allowsFullscreen
                allowsPictureInPicture
                contentFit="cover"
              />
            ) : null}
          </Pressable>
        </View>
      )}

      {Object.keys(post.reactions).length > 0 && (
        <View style={[styles.reactionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {Object.entries(post.reactions).map(([emoji, users]) => (
            <Pressable key={emoji} style={[styles.reactionBadge, profile && users.includes(profile.id) && styles.reactionActive]} onPress={() => handleReaction(emoji)}>
              <MaterialCommunityIcons name={emoji as any} size={14} color={profile && users.includes(profile.id) ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.reactionCount, profile && users.includes(profile.id) && { color: Colors.primary }]}>{users.length}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.divider} />

      <View style={[styles.actions, isRTL && { flexDirection: 'row-reverse' }]}>
        <Animated.View style={bounceAnim}>
          <Pressable style={styles.actionBtn} onPress={() => setShowReactions(!showReactions)}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        </Animated.View>
        <Pressable style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          {post.comments.length > 0 && <Text style={styles.actionCount}>{post.comments.length}</Text>}
        </Pressable>
      </View>

      {showReactions && (
        <View style={styles.reactionPicker}>
          {REACTIONS.map(e => (
            <Pressable key={e} style={styles.reactionPickerItem} onPress={() => handleReaction(e)}>
              <MaterialCommunityIcons name={e as any} size={28} color={Colors.primary} />
            </Pressable>
          ))}
        </View>
      )}

      {showComments && (
        <View style={styles.commentSection}>
          {post.comments.map(c => (
            <View key={c.id} style={[styles.commentItem, isRTL && { flexDirection: 'row-reverse' }]}>
              <Avatar avatarId={c.authorAvatarId} size={26} />
              <View style={[styles.commentBubble, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.commentNick, isRTL && styles.rtl]}>{c.authorNickname}</Text>
                <Text style={[styles.commentText, isRTL && styles.rtl]}>{t(c.commentKey)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.safeCommentRow}>
            {SAFE_COMMENT_KEYS.slice(0, 4).map(key => (
              <Pressable key={key} style={styles.safeCommentBtn} onPress={() => handleSafeComment(key)}>
                <Text style={styles.safeCommentText}>{t(key)}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.safeCommentRow}>
            {SAFE_COMMENT_KEYS.slice(4).map(key => (
              <Pressable key={key} style={styles.safeCommentBtn} onPress={() => handleSafeComment(key)}>
                <Text style={styles.safeCommentText}>{t(key)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function getTimeAgo(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRTL: { flexDirection: 'row-reverse' },
  headerInfo: { flex: 1 },
  nick: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  time: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  content: { fontSize: 15, color: Colors.text, lineHeight: 22, marginTop: 12 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  videoContainer: { marginTop: 12, borderRadius: 16, overflow: 'hidden', height: 200 },
  video: { width: '100%', height: 200 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: 10 },
  actions: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 12, color: Colors.textSecondary },
  reactionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  reactionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  reactionActive: { backgroundColor: 'rgba(255,107,138,0.12)', borderWidth: 1, borderColor: Colors.primary },
  reactionCount: { fontSize: 12, color: Colors.textSecondary },
  reactionPicker: {
    flexDirection: 'row', justifyContent: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
  },
  reactionPickerItem: { padding: 4 },
  commentSection: { marginTop: 12, gap: 8 },
  commentItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  commentBubble: { flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14, padding: 10 },
  commentNick: { fontSize: 12, fontWeight: '600' as const, color: Colors.text },
  commentText: { fontSize: 13, color: Colors.text, marginTop: 2 },
  safeCommentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  safeCommentBtn: {
    backgroundColor: 'rgba(255,107,138,0.08)', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,107,138,0.2)',
  },
  safeCommentText: { fontSize: 12, color: Colors.primary, fontWeight: '500' as const },
});
