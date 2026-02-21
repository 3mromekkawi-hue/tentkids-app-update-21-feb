import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper';

const termsText = `Your Terms & Conditions go here. Please read carefully before proceeding.`;

export default function TermsScreen({ navigation }: any) {
  const [checked, setChecked] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.termsBox}>
        <Text style={styles.termsText}>{termsText}</Text>
      </ScrollView>
      <View style={styles.checkboxRow}>
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={() => setChecked(!checked)}
        />
        <Text style={styles.checkboxLabel}>
          I am a parent and I agree to the Terms & Conditions
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, !checked && styles.buttonDisabled]}
        disabled={!checked}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  termsBox: { flex: 1, marginBottom: 16 },
  termsText: { fontSize: 16, color: '#333' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxLabel: { fontSize: 15, color: '#333', flex: 1 },
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
