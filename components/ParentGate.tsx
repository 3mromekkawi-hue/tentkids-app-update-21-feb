import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

interface ParentGateProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export function ParentGate({ visible, onSuccess, onClose }: ParentGateProps) {
  const { t, isRTL } = useApp();
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState<'+' | '*'>('+');
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [locked, setLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const shakeX = useSharedValue(0);
  const scaleVal = useSharedValue(1);

  const genProblem = useCallback(() => {
    const useAdd = Math.random() > 0.4;
    if (useAdd) {
      setA(Math.floor(Math.random() * 40 + 10));
      setB(Math.floor(Math.random() * 40 + 10));
      setOp('+');
    } else {
      setA(Math.floor(Math.random() * 9 + 2));
      setB(Math.floor(Math.random() * 9 + 2));
      setOp('*');
    }
    setAnswer('');
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (visible) { genProblem(); setAttempts(3); setLocked(false); }
  }, [visible, genProblem]);

  useEffect(() => {
    if (locked) {
      const timer = setInterval(() => {
        if (Date.now() >= lockTime) { setLocked(false); setAttempts(3); genProblem(); clearInterval(timer); }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [locked, lockTime, genProblem]);

  const handleSubmit = () => {
    if (locked || !answer) return;
    const correct = op === '+' ? a + b : a * b;
    if (parseInt(answer) === correct) {
      setFeedback('correct');
      scaleVal.value = withSequence(withSpring(1.2), withSpring(1));
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => onSuccess(), 600);
    } else {
      setFeedback('incorrect');
      shakeX.value = withSequence(withSpring(-10), withSpring(10), withSpring(-10), withSpring(0));
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const newAtt = attempts - 1;
      setAttempts(newAtt);
      if (newAtt <= 0) { setLocked(true); setLockTime(Date.now() + 300000); }
      else { setTimeout(() => { genProblem(); }, 800); }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scaleVal.value }],
  }));

  const remainingTime = locked ? Math.max(0, Math.ceil((lockTime - Date.now()) / 1000)) : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </Pressable>

          <Ionicons name="lock-closed" size={40} color={Colors.purple} />
          <Text style={[styles.title, isRTL && styles.rtlText]}>{t('parentGate')}</Text>
          <Text style={[styles.desc, isRTL && styles.rtlText]}>{t('parentGateDesc')}</Text>

          {locked ? (
            <View style={styles.lockedContainer}>
              <Ionicons name="time" size={48} color={Colors.danger} />
              <Text style={styles.lockedText}>{t('locked')}</Text>
              <Text style={styles.timerText}>{Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.mathContainer}>
                <Text style={styles.mathText}>{a} {op === '+' ? '+' : 'x'} {b} = ?</Text>
              </View>

              <TextInput
                style={styles.input}
                value={answer} onChangeText={setAnswer}
                keyboardType="number-pad" placeholder="?" placeholderTextColor={Colors.textSecondary}
                maxLength={5} textAlign="center"
              />

              {feedback && (
                <Text style={[styles.feedback, { color: feedback === 'correct' ? Colors.success : Colors.danger }]}>
                  {feedback === 'correct' ? t('correct') : t('incorrect')}
                </Text>
              )}

              <Text style={styles.attemptsText}>{t('attempts')}: {attempts}</Text>

              <Pressable style={[styles.submitBtn, !answer && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={!answer}>
                <Ionicons name="checkmark" size={24} color="#fff" />
              </Pressable>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: {
    backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center',
    width: '100%', maxWidth: 340, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  closeBtn: { position: 'absolute', top: 12, right: 12, padding: 4 },
  title: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, marginTop: 8 },
  desc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  mathContainer: { backgroundColor: 'rgba(124,77,255,0.08)', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 40, marginVertical: 8 },
  mathText: { fontSize: 32, fontWeight: '700' as const, color: Colors.purple },
  input: {
    width: 100, height: 56, borderRadius: 16, backgroundColor: Colors.background,
    fontSize: 24, fontWeight: '700' as const, color: Colors.text,
    borderWidth: 2, borderColor: Colors.purple,
  },
  feedback: { fontSize: 16, fontWeight: '600' as const },
  attemptsText: { fontSize: 13, color: Colors.textSecondary },
  submitBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  lockedContainer: { alignItems: 'center', gap: 12, marginTop: 16 },
  lockedText: { fontSize: 16, fontWeight: '600' as const, color: Colors.danger, textAlign: 'center' },
  timerText: { fontSize: 32, fontWeight: '700' as const, color: Colors.danger },
});
