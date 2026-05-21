import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/common/GlassCard';
import { VibrantBackground } from '../../components/common/VibrantBackground';
import { SwipeableTaskCard } from '../../components/tasks/SwipeableTaskCard';
import { TaskPreviewModal } from '../../components/tasks/TaskPreviewModal';

type TaskStatus = 'todo' | 'started' | 'done';

interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: TaskStatus;
  description?: string;
  deadline?: string;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Design new onboarding flow', priority: 'High',   status: 'todo',
    description: 'Redesign the first-run experience to reduce drop-off. Cover sign-up, permissions, and the welcome tour.',
    deadline: 'Due May 20' },
  { id: '2', title: 'Review pull requests',        priority: 'Medium', status: 'todo',
    description: 'Go through open PRs on the main repo and leave feedback.' },
  { id: '3', title: 'Write unit tests',            priority: 'Medium', status: 'done',
    description: 'Add coverage for the auth and task modules.',
    deadline: 'Due May 14' },
  { id: '4', title: 'Update documentation',        priority: 'Low',    status: 'todo' },
  { id: '5', title: 'Fix navigation bug',          priority: 'High',   status: 'todo',
    description: 'Deep-link into a task detail page crashes on Android 14. Reproduce and patch.',
    deadline: 'Due May 17' },
  { id: '6', title: 'Sync with design team',       priority: 'Low',    status: 'done' },
];

const PRIORITY_COLOR: Record<string, string> = {
  High: '#FF375F', Medium: '#FF9F0A', Low: '#30D158',
};
const PRIORITY_ORDER: Record<string, number> = {
  High: 0, Medium: 1, Low: 2,
};

export default function TaskListScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks]                 = useState<Task[]>(INITIAL_TASKS);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [filterOpen, setFilterOpen]           = useState(false);
  const [activeFilter, setActiveFilter] = useState<'completed' | 'priority' | null>(null);

  const selectFilter = (filter: 'completed' | 'priority') => {
    setActiveFilter(prev => prev === filter ? null : filter);
    setFilterOpen(false);
  };

  // Ref on the filter icon so we can measure its exact screen position
  const filterBtnRef = useRef<View>(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownRight, setDropdownRight] = useState(0);

  const handleFilterPress = () => {
    if (!filterOpen) {
      filterBtnRef.current?.measureInWindow((x, y, width, height) => {
        setDropdownTop(y + height + 6);
        // align dropdown's right edge with the button's right edge
        setDropdownRight(Dimensions.get('window').width - (x + width));
      });
      setFilterOpen(true);
    } else {
      setFilterOpen(false);
    }
  };

  const handleComplete = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      const rest = prev.filter(t => t.id !== id);
      return [...rest, { ...task, status: 'done' }];
    });
  };

  // Build the displayed list based on the active filter
  let displayedTasks: Task[];
  if (activeFilter === 'completed') {
    // Show only completed tasks
    displayedTasks = tasks.filter(t => t.status === 'done');
  } else if (activeFilter === 'priority') {
    // Sort incomplete tasks by priority; completed always stay at the bottom
    const incomplete = [...tasks.filter(t => t.status !== 'done')]
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    const completed = tasks.filter(t => t.status === 'done');
    displayedTasks = [...incomplete, ...completed];
  } else {
    displayedTasks = tasks;
  }

  const [previewTask, setPreviewTask] = useState<Task | null>(null);

  const handleLongPress = (task: Task) => {
    if (!task.description && !task.deadline) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPreviewTask(task);
  };

  const remaining = tasks.filter(t => t.status !== 'done').length;

  return (
    <View style={styles.root}>
      <VibrantBackground />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
        {/* ── Header ── */}
        <GlassCard style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Tasks</Text>
              <Text style={styles.headerSub}>{remaining} remaining</Text>
            </View>

            {/* Filter button — just the icon, no circle */}
            <View ref={filterBtnRef}>
              <Pressable onPress={handleFilterPress} style={styles.filterBtn}>
                <Ionicons name="reorder-three-outline" size={26} color="rgba(60,60,67,0.35)" />
              </Pressable>
            </View>
          </View>
        </GlassCard>

        {/* ── Task list ── */}
        {displayedTasks.map(task => (
          <SwipeableTaskCard
            key={task.id}
            onComplete={()   => handleComplete(task.id)}
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
                <View style={styles.taskRow}>
                  <View style={[styles.dot, { backgroundColor: PRIORITY_COLOR[task.priority] }]} />
                  <Text style={[styles.taskTitle, task.status === 'done' && styles.taskTitleDone]}>
                    {task.title}
                  </Text>
                </View>
              </GlassCard>
            </Pressable>
          </SwipeableTaskCard>
        ))}
      </ScrollView>

      {/* ── Task preview modal ── */}
      <TaskPreviewModal
        visible={previewTask !== null}
        title={previewTask?.title ?? ''}
        description={previewTask?.description}
        deadline={previewTask?.deadline}
        onClose={() => setPreviewTask(null)}
      />

      {/* ── Dropdown — lives outside ScrollView so it floats above everything ── */}
      {filterOpen && (
        <>
          {/* Transparent backdrop — tapping it closes the dropdown */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setFilterOpen(false)}
          />

          {/* The dropdown card, positioned below the filter button */}
          <GlassCard
            style={[styles.dropdown, { top: dropdownTop, right: dropdownRight }]}
          >
            <Pressable
              style={styles.dropdownItem}
              onPress={() => { setActiveFilter(null); setFilterOpen(false); }}
            >
              <Text style={styles.dropdownText}>Default</Text>
              {activeFilter === null && (
                <Ionicons name="checkmark" size={16} color="#007AFF" />
              )}
            </Pressable>

            <View style={styles.dropdownDivider} />

            <Pressable
              style={styles.dropdownItem}
              onPress={() => selectFilter('priority')}
            >
              <Text style={styles.dropdownText}>Priority</Text>
              {activeFilter === 'priority' && (
                <Ionicons name="checkmark" size={16} color="#007AFF" />
              )}
            </Pressable>

            <View style={styles.dropdownDivider} />

            <Pressable
              style={styles.dropdownItem}
              onPress={() => selectFilter('completed')}
            >
              <Text style={styles.dropdownText}>Completed</Text>
              {activeFilter === 'completed' && (
                <Ionicons name="checkmark" size={16} color="#007AFF" />
              )}
            </Pressable>
            
          </GlassCard>
        </>
      )}
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

  // Header
  header: { marginBottom: 4 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  filterBtn: {
    padding: 4,
  },

  // Dropdown
  dropdown: {
    position: 'absolute',
    width: 160,
    padding: 0,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dropdownText: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  dropdownDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.2)',
    marginHorizontal: 12,
  },

  // Task cards
  taskCard: { padding: 14 },
  taskDone: { opacity: 0.5 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
});
