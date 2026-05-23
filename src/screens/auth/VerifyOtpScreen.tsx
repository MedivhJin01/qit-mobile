import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VibrantBackground } from '../../components/common/VibrantBackground';
import { authStore } from '../../store/authStore';
import { verifyOtp, resendOtp, buildUserFromToken } from '../../services/authService';
import type { AuthParamList } from '../../navigation/AuthNavigator';

type Nav   = NativeStackNavigationProp<AuthParamList>;
type Route = RouteProp<AuthParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();
  const { registrationToken, email } = route.params;

  const [digits, setDigits]       = useState(['', '', '', '']);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    const t = setTimeout(() => refs[0].current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const otp = digits.join('');
  const canSubmit = otp.length === 4 && !loading;

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 3) refs[index + 1].current?.focus();
    if (next.every(d => d) && digit) handleVerify(next.join(''));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleVerify = async (code = otp) => {
    if (code.length !== 4 || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const { accessToken } = await verifyOtp(registrationToken, code);
      const user = buildUserFromToken(accessToken, email);
      authStore.setToken(accessToken);
      authStore.setUser(user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Verification Failed', e?.message ?? 'Invalid code. Please try again.');
      setDigits(['', '', '', '']);
      refs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOtp(registrationToken);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.root}>
      <VibrantBackground />

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.5)" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.wordmark}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a 4-digit code to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        </View>

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={refs[i]}
              style={[styles.otpBox, d ? styles.otpBoxFilled : null]}
              value={d}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.btn, !canSubmit && styles.btnDisabled, pressed && { opacity: 0.8 }]}
          onPress={() => handleVerify()}
          disabled={!canSubmit}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Verify</Text>
          }
        </Pressable>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive a code? </Text>
          <Pressable onPress={handleResend} disabled={resending} hitSlop={8}>
            <Text style={[styles.resendLink, resending && { opacity: 0.4 }]}>
              {resending ? 'Sending…' : 'Resend'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', marginBottom: 36 },
  backText: { fontSize: 16, color: 'rgba(255,255,255,0.5)' },

  wordmark: { marginBottom: 40 },
  title: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1.2 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.45)', marginTop: 8, lineHeight: 22 },
  emailHighlight: { color: '#fff', fontWeight: '600' },

  otpRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  otpBox: {
    flex: 1, height: 64, borderRadius: 14,
    fontSize: 28, fontWeight: '700', color: '#1C1C1E',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5, borderColor: 'rgba(60,60,67,0.15)',
  },
  otpBoxFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },

  btn: {
    backgroundColor: '#007AFF', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 17, fontWeight: '600', color: '#fff' },

  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  resendText: { fontSize: 15, color: 'rgba(255,255,255,0.4)' },
  resendLink: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
