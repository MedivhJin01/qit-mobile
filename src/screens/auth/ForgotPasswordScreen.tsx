import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';
import { forgotPassword } from '../../services/authService';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const canSubmit = email.trim().length > 0 && !loading;

  const handleSend = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <VibrantBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.5)" />
            <Text style={styles.backText}>Sign In</Text>
          </Pressable>

          <View style={styles.wordmark}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {sent
                ? "If that email is registered, you'll receive a reset link shortly."
                : "Enter your email and we'll send you a reset link."}
            </Text>
          </View>

          {!sent && (
            <GlassCard style={styles.card}>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(60,60,67,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                />
              </View>
            </GlassCard>
          )}

          <Pressable
            style={({ pressed }) => [styles.btn, !canSubmit && !sent && styles.btnDisabled, pressed && { opacity: 0.8 }]}
            onPress={sent ? () => navigation.goBack() : handleSend}
            disabled={!sent && !canSubmit}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{sent ? 'Back to Sign In' : 'Send Reset Link'}</Text>
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', marginBottom: 36 },
  backText: { fontSize: 16, color: 'rgba(255,255,255,0.5)' },

  wordmark: { marginBottom: 32 },
  title: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1.2 },
  subtitle: { fontSize: 17, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 24 },

  card: { padding: 0, gap: 0, marginBottom: 16 },
  field: { paddingHorizontal: 18, paddingVertical: 14 },
  label: {
    fontSize: 12, fontWeight: '600',
    color: 'rgba(60,60,67,0.55)', marginBottom: 5,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: { fontSize: 17, color: '#1C1C1E' },

  btn: {
    backgroundColor: '#007AFF', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
