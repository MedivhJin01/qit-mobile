import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';

const STATS = [
  { label: 'Tasks Done', value: '142', icon: '✓' },
  { label: 'Streak', value: '21d', icon: '🔥' },
  { label: 'Groups', value: '4', icon: '👥' },
];

const MENU_ITEMS = [
  { label: 'Notifications', icon: '🔔' },
  { label: 'Appearance', icon: '🎨' },
  { label: 'Privacy', icon: '🔒' },
  { label: 'Help & Support', icon: '❓' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <VibrantBackground />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>H</Text>
          </View>
          <Text style={styles.profileName}>Haoning Jin</Text>
          <Text style={styles.profileEmail}>medivhjin@gmail.com</Text>
        </GlassCard>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {STATS.map(stat => (
            <GlassCard key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Menu items */}
        <GlassCard style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <View key={item.label}>
              <View style={styles.menuRow}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuChevron}>›</Text>
              </View>
              {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  profileEmail: {
    fontSize: 14,
    color: '#3C3C43',
    opacity: 0.6,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 11,
    color: '#3C3C43',
    opacity: 0.6,
    marginTop: 2,
    textAlign: 'center',
  },
  menuCard: {
    padding: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  menuChevron: {
    fontSize: 22,
    color: '#3C3C43',
    opacity: 0.4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.2)',
    marginLeft: 48,
  },
});
