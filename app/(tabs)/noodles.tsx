import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  Animated,
  Share,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp, VideoItem } from '@/contexts/AppContext';
import { useAuth } from '../../context/AuthContext';

const { height, width } = Dimensions.get('window');

const REACTIONS = [
  { key: 'like', icon: 'thumb-up' },
  { key: 'love', icon: 'heart' },
  { key: 'haha', icon: 'emoticon-happy' },
  { key: 'wow', icon: 'emoticon-surprised' },
  { key: 'sad', icon: 'emoticon-cry' },
  { key: 'fire', icon: 'fire' },
];

function VideoCard({
  video,
  isActive,
}: {
  video: VideoItem;
  isActive: boolean;
}) {
  const { reactToVideo } = useApp();
  const player = useVideoPlayer(video.videoUrl);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!player) return;

    player.loop = true;

    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: video.videoUrl,
        url: video.videoUrl,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleReaction = (reaction: string) => {
    reactToVideo(video.id, reaction);
    setSelectedReaction(reaction);
    setShowReactions(false);
    setFloatingReaction(reaction);

    floatAnim.setValue(0);

    Animated.timing(floatAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setFloatingReaction(null);
    });
  };

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        controls={false}
      />

      {/* Floating Reaction Animation */}
      {floatingReaction && (
        <Animated.View
          style={[
            styles.floatingReaction,
            {
              opacity: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -120],
                  }),
                },
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              REACTIONS.find(r => r.key === floatingReaction)?.icon as any
            }
            size={60}
            color="white"
          />
        </Animated.View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => handleReaction('like')}
          onLongPress={() => setShowReactions(true)}
        >
          <MaterialCommunityIcons
            name={
              selectedReaction
                ? REACTIONS.find(r => r.key === selectedReaction)?.icon
                : 'thumb-up'
            }
            size={30}
            color="white"
          />
          <Text style={styles.actionText}>
            {video.reactions?.length || 0}
          </Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={handleShare}>
          <MaterialCommunityIcons
            name="share-variant"
            size={28}
            color="white"
          />
        </Pressable>

        {showReactions && (
          <View style={styles.reactionsPopup}>
            {REACTIONS.map(r => (
              <Pressable
                key={r.key}
                onPress={() => handleReaction(r.key)}
              >
                <MaterialCommunityIcons
                  name={r.icon as any}
                  size={28}
                  color="white"
                  style={{ marginHorizontal: 6 }}
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
  const { videos } = useApp();
  const { session } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  if (!session) return null;

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <VideoCard
          video={item}
          isActive={index === activeIndex}
        />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height, // مهم جدًا عشان ميظهرش فيديو تاني
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    position: 'absolute',
    right: 15,
    bottom: 120,
    alignItems: 'center',
    zIndex: 10,
  },
  actionBtn: {
    marginBottom: 20,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  reactionsPopup: {
    position: 'absolute',
    bottom: 70,
    right: 40,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 8,
    borderRadius: 30,
  },
  floatingReaction: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
  },
});