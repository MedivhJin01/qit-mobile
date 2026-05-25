import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';
import { SwipeableTaskCard } from '../../components/tasks/SwipeableTaskCard';
import { TaskPreviewModal } from '../../components/tasks/TaskPreviewModal';

type TaskStatus = 'todo' | 'started' | 'done';
type FilterKey  = 'all' | 'priority' | 'done';

interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: TaskStatus;
  description?: string;
  deadline?: string;
}

const INITIAL_TASKS: Task[] = [
  {
    id: '1', title: 'Design new onboarding flow', priority: 'High', status: 'started',
    description: 'Redesign the first-run experience to reduce drop-off. Cover sign-up, permissions, and the welcome tour.',
    deadline: 'May 20',
  },
  {
    id: '2', title: 'Review pull requests', priority: 'Medium', status: 'todo',
    description: 'Go through open PRs on the main repo and leave feedback.',
  },
  {
    id: '3', title: 'Write unit tests', priority: 'Medium', status: 'done',
    description: 'Add coverage for the auth and task modules.',
    deadline: 'May 14',
  },
  { id: '4', title: 'Update documentation', priority: 'Low', status: 'todo' },
  {
    id: '5', title: 'Fix navigation bug', priority: 'High', status: 'todo',
    description: 'Deep-link into a task detail page crashes on Android 14.',
    deadline: 'May 17',
  },
  { id: '6', title: 'Sync with design team', priority: 'Low', status: 'done' },
];

const PRIORITY_COLOR: Record<string, string> = {
  High: '#FF453A', Medium: '#FF9F0A', Low: '#30D158',
};
const PRIORITY_ORDER: Record<string, number> = {
  High: 0, Medium: 1, Low: 2,
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
const FILTERS: { key: FilterKey; label: string; icon: IoniconName }[] = [
  { key: 'all',      label: 'All',      icon: 'list-outline'             },
  { key: 'priority', label: 'Priority', icon: 'flag-outline'             },
  { key: 'done',     label: 'Done',     icon: 'checkmark-circle-outline' },
];

export default function TaskListScreen() {
  const insets = useSafeAreaInsets();

  const [tasks, setTasks]                 = useState<Task[]>(INITIAL_TASKS);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [activeFilter, setActiveFilter]   = useState<FilterKey>('all');
  const [previewTask, setPreviewTask]     = useState<Task | null>(null);

  /* ── Filtering ── */
  let displayedTasks: Task[];
  if (activeFilter === 'done') {
    displayedTasks = tasks.filter(t => t.status === 'done');
  } else if (activeFilter === 'priority') {
    const incomplete = [...tasks.filter(t => t.status !== 'done')]
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    displayedTasks = [...incomplete, ...tasks.filter(t => t.status === 'done')];
  } else {
    displayedTasks = tasks;
  }

  const remaining  = tasks.filter(t => t.status !== 'done').length;
  const doneCount  = tasks.filter(t => t.status === 'done').length;

  const handleComplete = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      return [...prev.filter(t => t.id !== id), { ...task, status: 'done' }];
    });
  };

  const handleLongPress = (task: Task) => {
    if (!task.description && !task.deadline) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPreviewTask(task);
  };

  const selectFilter = (key: FilterKey) => {
    Haptics.selectionAsync();
    setActiveFilter(key);
  };

  return (
    <View style={styles.root}>
      <VibrantBackground />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 130 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
        {/* ── Header card — title + count only ── */}
        <GlassCard style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Tasks</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{remaining}</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>
            {remaining === 0 ? 'All done 🎉' : `${remaining} remaining · ${doneCount} completed`}
          </Text>
        </GlassCard>

        {/* ── Filter chip strip — horizontal scroll, lives outside any card ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStrip}
          style={styles.filterScrollView}
        >
          {FILTERS.map(f => {
            const active = activeFilter === f.key;
            const count  = f.key === 'done' ? doneCount : f.key === 'all' ? tasks.length : remaining;
            return (
              <Pressable
                key={f.key}
                onPress={() => selectFilter(f.key)}
                style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
              >
                <View style={[styles.chip, active && styles.chipActive]}>
                  {!active && (
                    <BlurView
                      intensity={55}
                      tint="systemChromeMaterial"
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Ionicons
                    name={f.icon}
                    size={14}
                    color={active ? '#fff' : 'rgba(60,60,67,0.6)'}
                  />
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {f.label}
                  </Text>
                  <View style={[styles.chipCount, active && styles.chipCountActive]}>
                    <Text style={[styles.chipCountText, active && styles.chipCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Task list ── */}
        {displayedTasks.map(task => (
          <SwipeableTaskCard
            key={task.id}
            onComplete={()    => handleComplete(task.id)}
            onSwipeStart={() => setScrollEnabled(false)}
            onSwipeEnd={()   => setScrollEnabled(true)}
            disabled={task.status === 'done'}
          >
            <Pressable
              onLongPress={() => handleLongPress(task)}
              delayLongPress={400}
              style={({ pressed }) => pressed ? { opacity: 0.82 } as ViewStyle : undefined}
            >
              <GlassCard style={[styles.taskCard, task.status === 'done' && styles.taskDone]}>
                {/* Priority accent bar */}
                <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLOR[task.priority] }]} />

                <View style={styles.taskBody}>
                  <Text
                    style={[styles.taskTitle, task.status === 'done' && styles.taskTitleDone]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>

                  {task.status !== 'done' && (task.status === 'started' || !!task.deadline) && (
                    <View style={styles.metaRow}>
                      {task.status === 'started' && (
                        <View style={styles.statusBadge}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusText}>In Progress</Text>
                        </View>
                      )}
                      {task.deadline && task.status !== 'done' && (
                        <View style={styles.deadlineRow}>
                          <Ionicons name="calendar-outline" size={11} color="rgba(60,60,67,0.45)" />
                          <Text style={styles.deadlineText}>{task.deadline}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </GlassCard>
            </Pressable>
          </SwipeableTaskCard>
        ))}
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 76 },
          pressed && { opacity: 0.85, transform: [{ scale: 0.94 }] },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        accessibilityLabel="Add Task"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>

      {/* ── Long-press preview modal ── */}
      <TaskPreviewModal
        visible={previewTask !== null}
        title={previewTask?.title ?? ''}
        description={previewTask?.description}
        deadline={previewTask?.deadline}
        onClose={() => setPreviewTask(null)}
      />
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
    gap: 10,
  },

  /* ── Header ── */
  header: { gap: 6 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(60,60,67,0.5)',
    marginTop: 2,
  },

  /* ── Filter strip ── */
  filterScrollView: {
    marginHorizontal: -16,   // bleed to screen edges
  },
  filterStrip: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60,60,67,0.12)',
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: 'transparent',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.65)',
  },
  chipLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  chipCount: {
    backgroundColor: 'rgba(60,60,67,0.1)',
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  chipCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.55)',
  },
  chipCountTextActive: {
    color: '#fff',
  },

  /* ── Task cards ── */
  taskCard: {
    padding: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 20,
  },
  taskDone: {
    opacity: 0.42,
  },
  priorityBar: {
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  taskBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 7,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: 0.1,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: 'rgba(60,60,67,0.4)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deadlineText: {
    fontSize: 11,
    color: 'rgba(60,60,67,0.5)',
    fontWeight: '500',
  },

  /* ── FAB ── */
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
});
