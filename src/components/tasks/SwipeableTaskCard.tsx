import { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

const COMPLETE_DISTANCE = 200;
const COMPLETE_VELOCITY = 1.5;

interface Props {
  children:     React.ReactNode;
  onComplete:   () => void;
  onSwipeStart: () => void;
  onSwipeEnd:   () => void;
  disabled?:    boolean;    // when true (e.g. task is already done), ignore all swipes
}

export function SwipeableTaskCard({
  children,
  onComplete,
  onSwipeStart,
  onSwipeEnd,
  disabled = false,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;

  // Refs so PanResponder (created once) always calls the latest callbacks
  const onCompleteRef   = useRef(onComplete);
  const onSwipeStartRef = useRef(onSwipeStart);
  const onSwipeEndRef   = useRef(onSwipeEnd);
  const disabledRef     = useRef(disabled);
  useEffect(() => { onCompleteRef.current   = onComplete;   }, [onComplete]);
  useEffect(() => { onSwipeStartRef.current = onSwipeStart; }, [onSwipeStart]);
  useEffect(() => { onSwipeEndRef.current   = onSwipeEnd;   }, [onSwipeEnd]);
  useEffect(() => { disabledRef.current     = disabled;     }, [disabled]);

  const snapBack = () =>
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();

  const panResponder = useRef(
    PanResponder.create({

      // Ignore gesture entirely if this task is already done
      onMoveShouldSetPanResponder: (_, gs) =>
        !disabledRef.current &&
        Math.abs(gs.dx) > Math.abs(gs.dy) &&
        Math.abs(gs.dx) > 5,

      onPanResponderGrant: () => {
        onSwipeStartRef.current();
      },

      onPanResponderMove: (_, gs) => {
        translateX.setValue(Math.min(0, gs.dx));
      },

      onPanResponderRelease: (_, gs) => {
        onSwipeEndRef.current();

        const wentFarEnough = gs.dx < -COMPLETE_DISTANCE;
        const wasFastEnough = gs.vx < -COMPLETE_VELOCITY;

        if (wentFarEnough || wasFastEnough) {
          // Mark done immediately (reliable), then spring the card back
          onCompleteRef.current();
          snapBack();
        } else {
          snapBack();
        }
      },

      onPanResponderTerminate: () => {
        onSwipeEndRef.current();
        snapBack();
      },

      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 20,
  },
});
