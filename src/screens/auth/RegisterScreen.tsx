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
import { register } from '../../services/authService';
import type { AuthParamList } from '../../navigation/AuthNavigator';

type Nav = NativeStackNavigationProp<AuthParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef  = useRef<TextInput>(null);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const passwordsMatch = password === confirm;
  const canSubmit = email.trim().length > 0 && password.length >= 8 && confirm.length > 0 && passwordsMatch && !loading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const registrationToken = await register(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('VerifyOtp', { registrationToken, email: email.trim() });
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registration Failed', e?.message ?? 'Something went wrong.');
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.5)" />
            <Text style={styles.backText}>Sign In</Text>
          </Pressable>

          <View style={styles.wordmark}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join QueueIt and get things done.</Text>
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
              <View style={styles.row}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="rgba(60,60,67,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                />
                <Pressable onPress={() => setShowPass(v => !v)} hitSlop={12}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(60,60,67,0.45)" />
                </Pressable>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.field}>
              <View style={styles.row}>
                <Text style={[styles.label, { flex: 1 }]}>Confirm Password</Text>
                {confirm.length > 0 && (
                  <Ionicons
                    name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                    size={15}
                    color={passwordsMatch ? '#30D158' : '#FF375F'}
                  />
                )}
              </View>
              <TextInput
                ref={confirmRef}
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor="rgba(60,60,67,0.4)"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
          </GlassCard>

          <Pressable
            style={({ pressed }) => [styles.btn, !canSubmit && styles.btnDisabled, pressed && { opacity: 0.8 }]}
            onPress={handleRegister}
            disabled={!canSubmit}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <Text style={styles.footerLink}>Sign In</Text>
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

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', marginBottom: 32 },
  backText: { fontSize: 16, color: 'rgba(255,255,255,0.5)' },

  wordmark: { marginBottom: 32 },
  title: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1.2 },
  subtitle: { fontSize: 17, color: 'rgba(255,255,255,0.45)', marginTop: 6 },

  card: { padding: 0, gap: 0 },
  field: { paddingHorizontal: 18, paddingVertical: 14 },
  label: {
    fontSize: 12, fontWeight: '600',
    color: 'rgba(60,60,67,0.55)', marginBottom: 5,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: { fontSize: 17, color: '#1C1C1E' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(60,60,67,0.2)', marginHorizontal: 18 },

  btn: {
    backgroundColor: '#007AFF', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 17, fontWeight: '600', color: '#fff' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 15, color: 'rgba(255,255,255,0.4)' },
  footerLink: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
