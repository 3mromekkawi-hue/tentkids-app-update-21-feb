import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export function UsageTimer() {
  const { t, isRTL, sessionStartTime, resetSessionTime } = useApp();
  const [showBreak, setShowBreak] = useState(false);
  const bounceVal = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      if (elapsed >= 1800000 && !showBreak) {
        setShowBreak(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [sessionStartTime, showBreak]);

  useEffect(() => {
    if (showBreak) {
      bounceVal.value = withRepeat(
        withSequence(withTiming(-10, { duration: 300 }), withTiming(0, { duration: 300 })),
        3
      );
    }
  }, [showBreak, bounceVal]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceVal.value }],
  }));

  const handleDismiss = () => {
    setShowBreak(false);
    resetSessionTime();
  };

  return (
    <Modal visible={showBreak} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animStyle]}>
          <MaterialCommunityIcons name="sleep" size={64} color={Colors.accent} />
          <Text style={[styles.title, isRTL && styles.rtlText]}>{t('breakTime')}</Text>
          <Text style={[styles.message, isRTL && styles.rtlText]}>{t('breakMessage')}</Text>
          <Pressable style={styles.btn} onPress={handleDismiss}>
            <Text style={styles.btnText}>{t('okGotIt')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,15,46,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  btn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
