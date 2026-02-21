import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { avatars } from '@/constants/avatars';

interface AvatarProps {
  avatarId: string;
  size?: number;
  onPress?: () => void;
  selected?: boolean;
}

export function Avatar({ avatarId, size = 48, onPress, selected }: AvatarProps) {
  const avatar = avatars.find(a => a.id === avatarId) || avatars[0];
  const iconSize = size * 0.55;

  const content = (
    <View style={[
      styles.container,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: avatar.bgColor },
      selected && { borderWidth: 3, borderColor: avatar.color },
    ]}>
      <MaterialCommunityIcons name={avatar.icon} size={iconSize} color={avatar.color} />
    </View>
  );

  if (onPress) return <Pressable onPress={onPress}>{content}</Pressable>;
  return content;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
