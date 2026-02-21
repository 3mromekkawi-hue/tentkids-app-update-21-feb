import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp, VideoItem } from '@/contexts/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FallingSweets } from '@/components/FallingSweets';

const REACTIONS = ['heart', 'star', 'thumb-up', 'emoticon-happy', 'fire'];

function VideoCard({ video }: { video: VideoItem }) {
  const { language, isRTL, profile, reactToVideo } = useApp();
  const [showReactions, setShowReactions] = useState(false);
  const videoRef = React.useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const title = language === 'ar' ? video.titleAr : video.titleEn;

  const handleReaction = (emoji: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    reactToVideo(video.id, emoji);
    setShowReactions(false);
  };

  return (
    <View style={styles.videoCard}>
      <View style={[styles.videoThumb, { backgroundColor: video.thumbnailColor }]}>
        <Pressable
          style={{ width: '100%', height: '100%' }}
          onPress={async () => {
            try {
              if (!videoRef.current) return;
              // Ensure unmuted and audible before playing
              try {
                await videoRef.current.setIsMutedAsync(false);
                await videoRef.current.setVolumeAsync(1.0);
              } catch (e) {
                // not critical, keep trying to play
              }
              if (isPlaying) {
                await videoRef.current.pauseAsync();
                setIsPlaying(false);
              } else {
                await videoRef.current.playAsync();
                setIsPlaying(true);
              }
            } catch (e) {
              console.warn('Video play/pause error', e);
            }
          }}
        >
          <Video
            ref={videoRef}
            source={{ uri: video.videoUrl }}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping={false}
            isMuted={false}
            onError={(e) => console.warn('Video load error', e)}
            onLoad={async () => {
              try {
                if (videoRef.current) {
                  await videoRef.current.setIsMutedAsync(false);
                  await videoRef.current.setVolumeAsync(1.0);
                }
              } catch (e) {
                console.warn('Video onLoad audio init failed', e);
              }
            }}
          />
        </Pressable>
      </View>

      <View style={styles.videoInfo}>
        <Text style={[styles.videoTitle, isRTL && styles.rtl]} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.videoDuration}>{video.duration}</Text>

        {Object.keys(video.reactions).length > 0 && (
          <View style={[styles.reactionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
            {Object.entries(video.reactions).map(([emoji, users]) => (
              <Pressable
                key={emoji}
                style={[
                  styles.reactionBadge,
                  profile && users.includes(profile.id) && styles.reactionActive,
                ]}
                onPress={() => handleReaction(emoji)}
              >
                <MaterialCommunityIcons
                  name={emoji as any}
                  size={14}
                  color={
                    profile && users.includes(profile.id)
                      ? Colors.primary
                      : Colors.textSecondary
                  }
                />
                <Text style={styles.reactionCount}>{users.length}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={[styles.actionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Pressable
            style={styles.emojiBtn}
            onPress={() => setShowReactions(!showReactions)}
          >
            <MaterialCommunityIcons
              name="emoticon-happy-outline"
              size={22}
              color={Colors.textSecondary}
            />
          </Pressable>
        </View>

        {showReactions && (
          <View style={styles.reactionPicker}>
            {REACTIONS.map((e) => (
              <Pressable
                key={e}
                style={styles.reactionItem}
                onPress={() => handleReaction(e)}
              >
                <MaterialCommunityIcons
                  name={e as any}
                  size={26}
                  color={Colors.primary}
                />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function NoodlesScreen() {
  const { t, isRTL, videos } = useApp();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [showSweets, setShowSweets] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSweets(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!session) {
    return (
      <LinearGradient
        colors={[Colors.background, '#E8F0FF', '#F0E4FF', Colors.background]}
        style={styles.container}
      >
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="noodles" size={64} color={Colors.textMuted} />
          <Text style={[styles.emptyTitle, isRTL && styles.rtl]}>
            {t('loginToViewVideos')}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.background, '#E8F0FF', '#F0E4FF', Colors.background]}
      style={styles.container}
    >
      {showSweets && <FallingSweets count={12} />}

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 8 },
        ]}
      >
        <Text style={[styles.title, isRTL && styles.rtl]}>
          {t('noodles')}
        </Text>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VideoCard video={item} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 },
          videos.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="noodles" size={64} color={Colors.textMuted} />
            <Text style={[styles.emptyTitle, isRTL && styles.rtl]}>
              {t('noVideosYet')}
            </Text>
            <Text style={[styles.emptySub, isRTL && styles.rtl]}>
              {t('videosComingSoon')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  listContent: { padding: 16 },
  emptyList: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary },
  videoCard: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoThumb: { height: 200 },
  videoPlayer: { width: '100%', height: 200 },
  videoInfo: { padding: 14, gap: 6 },
  videoTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  videoDuration: { fontSize: 12, color: Colors.textMuted },
  reactionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reactionActive: {
    backgroundColor: 'rgba(255,107,138,0.12)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  reactionCount: { fontSize: 12, color: Colors.textSecondary },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  emojiBtn: { padding: 4 },
  reactionPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 10,
    marginTop: 6,
  },
  reactionItem: { padding: 4 },
});
