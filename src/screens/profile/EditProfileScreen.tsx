import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';
import { authStore } from '../../store/authStore';
import {
  deleteProfilePic,
  getUploadUrl,
  updateProfilePic,
  updateUsername,
  uploadToS3,
} from '../../services/profileService';

const USERNAME_REGEX = /^[a-zA-Z0-9_ ]{1,20}$/;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const user = authStore.getUser();
  const [username, setUsername]       = useState(user?.username ?? '');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null); // picked but not yet saved
  const [removePhoto, setRemovePhoto] = useState(false); // user wants to delete existing photo
  const [saving, setSaving]           = useState(false);

  const existingPhotoUrl = user?.profilePicUrl ?? null;
  const displayUri       = removePhoto ? null : (localImageUri ?? existingPhotoUrl);

  const usernameChanged = username.trim() !== (user?.username ?? '');
  const photoChanged    = localImageUri !== null || removePhoto;
  const isDirty         = usernameChanged || photoChanged;
  const isValid         = USERNAME_REGEX.test(username.trim()) || username.trim() === (user?.username ?? '');
  const canSave         = isDirty && isValid && !saving;

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to your photo library to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri);
      setRemovePhoto(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAvatarPress = () => {
    const options: string[] = ['Choose from Library'];
    if (existingPhotoUrl && !removePhoto) options.push('Remove Photo');
    options.push('Cancel');

    Alert.alert('Profile Photo', undefined, [
      { text: 'Choose from Library', onPress: pickImage },
      ...(existingPhotoUrl && !removePhoto
        ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => { setRemovePhoto(true); setLocalImageUri(null); } }]
        : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!canSave) return;
    const token = authStore.getToken();
    if (!token) { Alert.alert('Not logged in', 'Please log in first.'); return; }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      // Username
      if (usernameChanged && USERNAME_REGEX.test(username.trim())) {
        await updateUsername(username.trim(), token);
      }

      // Photo: upload new
      if (localImageUri) {
        const { presignedUrl, fileUrl } = await getUploadUrl(token);
        await uploadToS3(presignedUrl, localImageUri);
        await updateProfilePic(fileUrl, token);
        authStore.setUser(user ? { ...user, username: username.trim(), profilePicUrl: fileUrl } : null);
      }
      // Photo: remove
      else if (removePhoto) {
        await deleteProfilePic(token);
        authStore.setUser(user ? { ...user, username: username.trim(), profilePicUrl: undefined } : null);
      }
      // No photo change
      else {
        authStore.setUser(user ? { ...user, username: username.trim() } : null);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Update failed', e?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = (username[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  return (
    <View style={styles.root}>
      <VibrantBackground />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <GlassCard style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={({ pressed }) => pressed && { opacity: 0.5 }}
            >
              <Ionicons name="chevron-back" size={22} color="#007AFF" />
            </Pressable>

            <Text style={styles.headerTitle}>Edit Profile</Text>

            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              hitSlop={12}
              style={({ pressed }) => [!canSave && { opacity: 0.3 }, pressed && { opacity: 0.5 }]}
            >
              {saving
                ? <ActivityIndicator size="small" color="#007AFF" />
                : <Text style={styles.saveText}>Save</Text>
              }
            </Pressable>
          </GlassCard>

          {/* ── Avatar ── */}
          <GlassCard style={styles.avatarCard}>
            <Pressable style={styles.avatarWrap} onPress={handleAvatarPress}>
              {displayUri ? (
                <Image source={{ uri: displayUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarRing}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                  </View>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </Pressable>

            <Text style={styles.avatarName}>
              {username.trim() || user?.email?.split('@')[0] || 'Your Name'}
            </Text>
            <Text style={styles.avatarEmail}>{user?.email ?? ''}</Text>
          </GlassCard>

          {/* ── Fields ── */}
          <GlassCard style={styles.fieldsCard}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                ref={inputRef}
                style={styles.fieldInput}
                value={username}
                onChangeText={setUsername}
                placeholder="Add username"
                placeholderTextColor="rgba(60,60,67,0.3)"
                maxLength={20}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Text style={styles.charCount}>{username.length}/20</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldReadOnly} numberOfLines={1}>
                {user?.email ?? '—'}
              </Text>
              <Ionicons name="lock-closed" size={13} color="rgba(60,60,67,0.3)" />
            </View>
          </GlassCard>

          {username.trim().length > 0 && !USERNAME_REGEX.test(username.trim()) && (
            <Text style={styles.errorText}>
              Letters, numbers, underscores and spaces only (max 20)
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },

  // Avatar
  avatarCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  avatarWrap: {
    marginBottom: 8,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  avatarLetter: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  avatarEmail: {
    fontSize: 14,
    color: '#3C3C43',
    opacity: 0.5,
  },

  // Fields
  fieldsCard: { padding: 0 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldLabel: {
    width: 76,
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    textAlign: 'right',
  },
  charCount: {
    fontSize: 12,
    color: '#3C3C43',
    opacity: 0.3,
  },
  fieldReadOnly: {
    flex: 1,
    fontSize: 15,
    color: '#3C3C43',
    opacity: 0.55,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.2)',
    marginLeft: 16,
  },

  errorText: {
    fontSize: 13,
    color: '#FF375F',
    paddingHorizontal: 4,
  },
});
