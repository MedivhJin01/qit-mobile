import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';
import { authStore } from '../../store/authStore';
import { login, buildUserFromToken } from '../../services/authService';
import type { AuthParamList } from '../../navigation/AuthNavigator';

type Nav = NativeStackNavigationProp<AuthParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 8 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const { accessToken } = await login(email.trim(), password);
      const user = buildUserFromToken(accessToken, email.trim());
      authStore.setToken(accessToken);
      authStore.setUser(user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sign In Failed', e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <VibrantBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.wordmark}>
            <Text style={styles.title}>QueueIt</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

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
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(60,60,67,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable onPress={() => setShowPass(v => !v)} hitSlop={12}>
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="rgba(60,60,67,0.45)"
                  />
                </Pressable>
              </View>
            </View>
          </GlassCard>

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={({ pressed }) => [styles.forgotRow, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btn, !canSubmit && styles.btnDisabled, pressed && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={!canSubmit}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },

  wordmark: { marginBottom: 36 },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 6,
  },

  card: { padding: 0, gap: 0 },
  field: { paddingHorizontal: 18, paddingVertical: 14 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.55)',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: { fontSize: 17, color: '#1C1C1E' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.2)',
    marginHorizontal: 18,
  },

  forgotRow: { alignSelf: 'flex-end', marginTop: 12, marginBottom: 24 },
  forgotText: { fontSize: 15, color: 'rgba(255,255,255,0.5)' },

  btn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 17, fontWeight: '600', color: '#fff' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 15, color: 'rgba(255,255,255,0.4)' },
  footerLink: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
