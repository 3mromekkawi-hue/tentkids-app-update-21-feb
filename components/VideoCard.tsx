import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp, VideoItem } from '@/contexts/AppContext';

interface VideoCardProps {
  video: VideoItem;
}

export function VideoCard({ video }: VideoCardProps) {
  const { language, isRTL, profile, toggleVideoLike, toggleVideoSave } = useApp();
  const isLiked = profile ? video.likes.includes(profile.id) : false;
  const isSaved = profile ? video.saved.includes(profile.id) : false;

  const heartScale = useSharedValue(1);
  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const title = language === 'ar' ? video.titleAr : video.titleEn;
  const desc = language === 'ar' ? video.descriptionAr : video.descriptionEn;

  const handleLike = () => {
    heartScale.value = withSequence(withSpring(1.5), withSpring(1));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleVideoLike(video.id);
  };

  const handleSave = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleVideoSave(video.id);
  };

  return (
    <View style={styles.card}>
      <View style={[styles.thumbnail, { backgroundColor: video.thumbnailColor }]}>
        <MaterialCommunityIcons name={video.iconName as any} size={56} color="rgba(255,255,255,0.9)" />
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={32} color="#fff" />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, isRTL && styles.rtlText]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.desc, isRTL && styles.rtlText]} numberOfLines={1}>{desc}</Text>

        <View style={[styles.actions, isRTL && styles.actionsRTL]}>
          <Pressable style={styles.actionBtn} onPress={handleLike}>
            <Animated.View style={heartAnimStyle}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? Colors.danger : Colors.textSecondary} />
            </Animated.View>
            {video.likes.length > 0 && <Text style={styles.actionCount}>{video.likes.length}</Text>}
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleSave}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? Colors.secondary : Colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnail: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  info: {
    padding: 14,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  desc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionsRTL: {
    flexDirection: 'row-reverse',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
