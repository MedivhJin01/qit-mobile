import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';

const MOCK_ROUTINES = [
  { id: '1', name: 'Morning Workout', frequency: 'Daily', streak: 12, icon: '🏃' },
  { id: '2', name: 'Read 30 Minutes', frequency: 'Daily', streak: 7, icon: '📚' },
  { id: '3', name: 'Weekly Review', frequency: 'Weekly', streak: 4, icon: '📝' },
  { id: '4', name: 'Meditation', frequency: 'Daily', streak: 21, icon: '🧘' },
  { id: '5', name: 'Team Standup', frequency: 'Weekdays', streak: 9, icon: '💬' },
];

export default function RoutineListScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <VibrantBackground />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.header}>
          <Text style={styles.headerTitle}>Routines</Text>
          <Text style={styles.headerSub}>{MOCK_ROUTINES.length} active habits</Text>
        </GlassCard>

        {MOCK_ROUTINES.map(routine => (
          <GlassCard key={routine.id} style={styles.routineCard}>
            <View style={styles.routineRow}>
              <Text style={styles.routineIcon}>{routine.icon}</Text>
              <View style={styles.routineText}>
                <Text style={styles.routineName}>{routine.name}</Text>
                <Text style={styles.routineFreq}>{routine.frequency}</Text>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakCount}>{routine.streak}</Text>
                <Text style={styles.streakLabel}>streak</Text>
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
  routineCard: {
    padding: 14,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routineIcon: {
    fontSize: 32,
  },
  routineText: {
    flex: 1,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  routineFreq: {
    fontSize: 13,
    color: '#3C3C43',
    opacity: 0.6,
    marginTop: 2,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,159,10,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9F0A',
  },
  streakLabel: {
    fontSize: 10,
    color: '#FF9F0A',
    opacity: 0.8,
  },
});
