import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const SWEET_ICONS: Array<{ name: string; color: string }> = [
  { name: 'candy', color: '#FF80AB' },
  { name: 'cupcake', color: '#CE93D8' },
  { name: 'cookie', color: '#FFAB91' },
  { name: 'ice-cream', color: '#81D4FA' },
  { name: 'star-four-points', color: '#FFD54F' },
  { name: 'heart', color: '#FF6B8A' },
  { name: 'cake-variant', color: '#FF7043' },
  { name: 'candy-outline', color: '#B388FF' },
];

function FallingSweetItem({ index, totalCount }: { index: number; totalCount: number }) {
  const sweet = SWEET_ICONS[index % SWEET_ICONS.length];
  const startX = useMemo(() => Math.random() * (SCREEN_W - 30), []);
  const delay = useMemo(() => index * 120 + Math.random() * 200, [index]);
  const size = useMemo(() => 16 + Math.random() * 14, []);
  const rotation = useMemo(() => Math.random() * 360, []);

  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_H + 50, {
        duration: 2200 + Math.random() * 1200,
        easing: Easing.out(Easing.quad),
      })
    );
    opacity.value = withDelay(
      delay + 1800,
      withTiming(0, { duration: 600 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.sweet, { left: startX }, animStyle]}>
      <MaterialCommunityIcons name={sweet.name as any} size={size} color={sweet.color} />
    </Animated.View>
  );
}

interface FallingSweetsProps {
  count?: number;
}

export function FallingSweets({ count = 15 }: FallingSweetsProps) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {items.map(i => (
        <FallingSweetItem key={i} index={i} totalCount={count} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 999,
    pointerEvents: 'none',
  },
  sweet: {
    position: 'absolute',
    top: -50,
  },
});
