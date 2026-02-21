import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { Audio } from 'expo-av';

export default function AudioDebug() {
  const [soundObj, setSoundObj] = useState<any>(null);
  const [statusText, setStatusText] = useState('idle');

  useEffect(() => {
    return () => {
      (async () => {
        if (soundObj) {
          try { await soundObj.unloadAsync(); } catch {};
        }
      })();
    };
  }, [soundObj]);

  const playSample = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { shouldPlay: true, isMuted: false, volume: 1.0 }
      );
      setSoundObj(sound);
      setStatusText('playing');
      sound.setOnPlaybackStatusUpdate((s: any) => setStatusText(JSON.stringify({ positionMillis: s.positionMillis, isPlaying: s.isPlaying, volume: s.volume })));
    } catch (e: any) {
      Alert.alert('Audio Error', e.message || String(e));
    }
  };

  const stopSample = async () => {
    try {
      if (!soundObj) return;
      await soundObj.stopAsync();
      await soundObj.unloadAsync();
      setSoundObj(null);
      setStatusText('stopped');
    } catch (e: any) {
      Alert.alert('Stop Error', e.message || String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Debug</Text>
      <Text style={styles.status}>Status: {statusText}</Text>
      <View style={styles.row}>
        <Button title="Play Sample Audio" onPress={playSample} />
        <View style={{ width: 12 }} />
        <Button title="Stop" onPress={stopSample} />
      </View>
      <Text style={styles.hint}>If you hear nothing: check device mute switch and volume, then paste any errors here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  status: { marginBottom: 16 },
  row: { flexDirection: 'row' },
  hint: { marginTop: 20, color: '#666' },
});
