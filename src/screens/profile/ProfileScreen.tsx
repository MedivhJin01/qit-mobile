import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuthUser } from '../../hooks/useAuthStore';
import { authStore } from '../../store/authStore';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STATS = [
  { label: 'Tasks Done', value: '142', icon: 'checkmark-circle' as IoniconName, color: '#30D158' },
  { label: 'Day Streak', value: '21',  icon: 'flame'            as IoniconName, color: '#FF9F0A' },
  { label: 'Groups',     value: '4',   icon: 'people'           as IoniconName, color: '#0A84FF' },
];

// 0 = none, 1 = light, 2 = medium, 3 = full
const WEEK_ACTIVITY = [
  { day: 'Mon', count: 3, level: 3 },
  { day: 'Tue', count: 2, level: 2 },
  { day: 'Wed', count: 1, level: 1 },
  { day: 'Thu', count: 3, level: 3 },
  { day: 'Fri', count: 0, level: 0 },
  { day: 'Sat', count: 2, level: 2 },
  { day: 'Sun', count: 1, level: 1 },
];

const ACTIVITY_COLORS = ['rgba(48,209,88,0.12)', 'rgba(48,209,88,0.35)', 'rgba(48,209,88,0.65)', '#30D158'];


interface MenuItem {
  label: string;
  icon: IoniconName;
  color: string;
  destructive?: boolean;
}

const MENU_SECTIONS: MenuItem[][] = [
  [
    { label: 'Notifications', icon: 'notifications-outline', color: '#FF9F0A' },
    { label: 'Appearance',    icon: 'color-palette-outline', color: '#6E5CE6' },
    { label: 'Privacy',       icon: 'lock-closed-outline',   color: '#30D158' },
  ],
  [
    { label: 'Sign Out', icon: 'log-out-outline', color: '#FF375F', destructive: true },
  ],
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const user = useAuthUser();

  const avatarLetter = (user?.username?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  const handlePress = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.label === 'Sign Out') {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => authStore.logout() },
      ]);
    }
  };

  return (
    <View style={styles.root}>
      <VibrantBackground />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile card ── */}
        <GlassCard style={styles.profileCard}>
          <Text style={styles.headerTitle}>Account</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{avatarLetter}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.username ?? '—'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
              <Text style={styles.profileJoined}>Member since Jan 2025</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.6 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('EditProfile');
              }}
            >
              <Ionicons name="pencil" size={15} color="#007AFF" />
            </Pressable>
          </View>
        </GlassCard>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {STATS.map(stat => (
            <GlassCard key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* ── Weekly activity ── */}
        <GlassCard>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <Text style={styles.sectionSub}>11 tasks completed</Text>
          </View>
          <View style={styles.activityRow}>
            {WEEK_ACTIVITY.map(d => (
              <View key={d.day} style={styles.activityCol}>
                <View style={[styles.activityBar, { backgroundColor: ACTIVITY_COLORS[d.level] }]}>
                  {d.count > 0 && <Text style={styles.activityCount}>{d.count}</Text>}
                </View>
                <Text style={styles.activityDay}>{d.day}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* ── Settings ── */}
        {MENU_SECTIONS.map((section, si) => (
          <GlassCard key={si} style={styles.menuCard}>
            {section.map((item, ii) => (
              <View key={item.label}>
                <Pressable
                  style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.6 }]}
                  onPress={() => handlePress(item)}
                >
                  <View style={[styles.iconBadge, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={16} color="#fff" />
                  </View>
                  <Text style={[styles.menuLabel, item.destructive && styles.menuDestructive]}>
                    {item.label}
                  </Text>
                  {!item.destructive && (
                    <Ionicons name="chevron-forward" size={17} color="rgba(60,60,67,0.35)" />
                  )}
                </Pressable>
                {ii < section.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </GlassCard>
        ))}

        <Text style={styles.version}>qit · v1.0.0</Text>
      </ScrollView>
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

  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.4,
  },

  // Profile
  profileCard: { gap: 12 },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  profileEmail: {
    fontSize: 13,
    color: '#3C3C43',
    opacity: 0.6,
    marginTop: 2,
  },
  profileJoined: {
    fontSize: 12,
    color: '#3C3C43',
    opacity: 0.4,
    marginTop: 3,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,122,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 11,
    color: '#3C3C43',
    opacity: 0.6,
    textAlign: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  sectionSub: {
    fontSize: 13,
    color: '#3C3C43',
    opacity: 0.5,
  },

  // Weekly activity
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  activityCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  activityBar: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  activityDay: {
    fontSize: 11,
    color: '#3C3C43',
    opacity: 0.5,
  },

  // Menu
  menuCard: { padding: 0 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  menuDestructive: {
    color: '#FF375F',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.2)',
    marginLeft: 61,
  },

  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#3C3C43',
    opacity: 0.35,
    marginTop: 4,
    marginBottom: 8,
  },
});
