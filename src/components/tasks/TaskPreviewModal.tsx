import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../common/GlassCard';

interface Props {
  visible:      boolean;
  title:        string;
  description?: string;
  deadline?:    string;
  onClose:      () => void;
}

export function TaskPreviewModal({ visible, title, description, deadline, onClose }: Props) {
  const scale   = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, bounciness: 5, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 160,  useNativeDriver: true }),
      ]).start();
    } else {
      // Reset instantly so next open starts fresh
      scale.setValue(0.88);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>

      {/* Blurred backdrop — tap anywhere to dismiss */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      {/* Preview card — springs in from slightly smaller */}
      <View style={styles.centeredWrapper} pointerEvents="box-none">
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <GlassCard style={styles.card}>

            <Text style={styles.title}>{title}</Text>

            {description && (
              <Text style={styles.description}>{description}</Text>
            )}

            {deadline && (
              <View style={styles.deadlineRow}>
                <Ionicons name="calendar-outline" size={14} color="#3C3C43" />
                <Text style={styles.deadline}>{deadline}</Text>
              </View>
            )}

          </GlassCard>
        </Animated.View>
      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  description: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  deadline: {
    fontSize: 13,
    color: '#3C3C43',
    opacity: 0.7,
  },
});
