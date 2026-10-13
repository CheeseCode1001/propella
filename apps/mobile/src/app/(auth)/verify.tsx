import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  const verifySignup = useAuthStore((s) => s.verifySignup);

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleVerify() {
    if (code.trim().length < 6) {
      setError('Please enter the full 6-digit verification code');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await verifySignup(email, code.trim());
      router.replace('/(onboarding)/onboarding');
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    try {
      await api.post('/auth/resend-signup-code', { email });
      setCountdown(60);
      Alert.alert('Code Sent', 'A new 6-digit code has been sent to your email.');
    } catch {
      Alert.alert('Notice', 'Unable to resend at this moment. Please check spam folder.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Palette.ink} />
        </TouchableOpacity>

        <View style={styles.badge}>
          <Ionicons name="mail" size={32} color={Palette.accent} />
        </View>

        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit verification code to:{'\n'}
          <Text style={styles.emailHighlight}>{email || 'your email'}</Text>
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Palette.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 6-digit code input */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor={Palette.ink3}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(v) => {
              setCode(v);
              if (error) setError(null);
            }}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
          onPress={handleVerify}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Verify & Continue</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn’t receive the code?</Text>
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
            <Text
              style={[
                styles.resendLink,
                countdown > 0 && styles.resendLinkDisabled,
              ]}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  title: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: Palette.ink,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.ink3,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Palette.ink,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.dangerTint,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F9D1D1',
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: Palette.danger,
    flex: 1,
    fontWeight: '500',
  },
  inputCard: {
    width: '100%',
    backgroundColor: Palette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.rule,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  codeInput: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 32,
    fontWeight: '700',
    color: Palette.accent,
    letterSpacing: 10,
    textAlign: 'center',
    width: '80%',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Palette.accent,
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  resendText: {
    fontSize: 13,
    color: Palette.ink3,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.accent,
  },
  resendLinkDisabled: {
    color: Palette.ink3,
  },
});
