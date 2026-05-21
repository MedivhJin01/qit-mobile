import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';

const MOCK_GROUPS = [
  { id: '1', name: 'Design Team', members: 6, tasks: 14, color: '#5E5CE6' },
  { id: '2', name: 'Engineering', members: 12, tasks: 31, color: '#0A84FF' },
  { id: '3', name: 'Marketing', members: 4, tasks: 8, color: '#FF375F' },
  { id: '4', name: 'Personal Projects', members: 1, tasks: 5, color: '#30D158' },
];

export default function GroupListScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <VibrantBackground />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.header}>
          <Text style={styles.headerTitle}>Groups</Text>
          <Text style={styles.headerSub}>{MOCK_GROUPS.length} workspaces</Text>
        </GlassCard>

        {MOCK_GROUPS.map(group => (
          <GlassCard key={group.id} style={styles.groupCard}>
            <View style={styles.groupRow}>
              <View style={[styles.groupAvatar, { backgroundColor: group.color }]}>
                <Text style={styles.groupAvatarLetter}>{group.name[0]}</Text>
              </View>
              <View style={styles.groupText}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMeta}>{group.members} members · {group.tasks} tasks</Text>
              </View>
            </View>
          </GlassCard>
        ))}
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
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.4,
  },
  headerSub: {
    fontSize: 15,
    color: '#3C3C43',
    marginTop: 2,
    opacity: 0.6,
  },
  groupCard: {
    padding: 14,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  groupText: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  groupMeta: {
    fontSize: 13,
    color: '#3C3C43',
    opacity: 0.6,
    marginTop: 2,
  },
});
