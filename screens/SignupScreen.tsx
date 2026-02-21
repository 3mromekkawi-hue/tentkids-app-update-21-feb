import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../contexts/AppContext';
import { router } from 'expo-router';

export default function SignupScreen() {
  const { signUp, loading } = useAuth();
  const { setProfile, setIsOnboarded, language } = useApp();
  const [parentEmail, setParentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true); // Must come from TermsScreen
  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState('bear');
  const [tentColor, setTentColor] = useState('cream');

  const handleSignUp = async () => {
    try {
      const user = await signUp(parentEmail, password, termsAccepted);
      if (!user || !user.id) throw new Error('Signup failed');
      // Save onboarding data after signup
      await setProfile({
        id: user.id,
        nickname: nickname.trim() || (language === 'ar' ? 'طفل' : 'Kid'),
        avatarId,
        tentColor,
        tentGlow: '#FFE0B2',
        status: '',
        friendCount: 0,
        createdAt: Date.now(),
      });
      await setIsOnboarded(true);
      router.replace('/(tabs)/cookies');
    } catch (e: any) {
      Alert.alert('Signup Error', e.message || 'Failed to sign up');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Parent Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Parent Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={parentEmail}
        onChangeText={setParentEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Nickname"
        value={nickname}
        onChangeText={setNickname}
      />
      <TextInput
        style={styles.input}
        placeholder="Avatar ID (e.g. bear)"
        value={avatarId}
        onChangeText={setAvatarId}
      />
      <TextInput
        style={styles.input}
        placeholder="Tent Color (e.g. cream)"
        value={tentColor}
        onChangeText={setTentColor}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        disabled={loading}
        onPress={handleSignUp}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
