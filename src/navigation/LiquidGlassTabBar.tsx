import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GlassContainer, GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<string, { icon: IoniconName; iconFocused: IoniconName; label: string }> = {
  Tasks:    { icon: 'checkmark-circle-outline', iconFocused: 'checkmark-circle',   label: 'Tasks' },
  Routines: { icon: 'repeat-outline',           iconFocused: 'repeat',             label: 'Routines' },
  Groups:   { icon: 'people-outline',           iconFocused: 'people',             label: 'Groups' },
  Account:  { icon: 'person-circle-outline',    iconFocused: 'person-circle',      label: 'Account' },
};

const ACTIVE_COLOR   = '#007AFF';
const INACTIVE_COLOR = '#8E8E93';
const BAR_HEIGHT     = 60;
const PILL_HEIGHT    = 53;
const PILL_RADIUS    = 30;
const PILL_H_MARGIN  = 5;  // gap between pill edge and tab edge
const BAR_H_MARGIN   = 20; // space between bar and screen left/right edges
const BAR_B_MARGIN   = -13; // space between bar and the home indicator
const BAR_RADIUS     = 30; // how round the bar's corners are

export function LiquidGlassTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const screenWidth = Dimensions.get('window').width;
  const barWidth    = screenWidth - BAR_H_MARGIN * 2; // actual bar width after margins
  const tabCount    = state.routes.length;
  const tabWidth    = barWidth / tabCount;             // each tab's share of the bar
  const pillWidth   = tabWidth - PILL_H_MARGIN * 2;
  const pillLeft    = state.index * tabWidth + PILL_H_MARGIN;
  const pillTop     = (BAR_HEIGHT - PILL_HEIGHT) / 2;

  return (
    <View style={[styles.container, { bottom: insets.bottom + BAR_B_MARGIN }]}>

      {/* ── Glass background layer ── */}
      {isLiquidGlassAvailable() ? (
        /**
         * GlassContainer groups the two GlassViews so their refraction
         * fields merge where they touch — the classic iOS 26 "liquid" look.
         * spacing=8 matches the PILL_H_MARGIN gap so they start merging
         * right at the pill boundary.
         */
        <GlassContainer style={StyleSheet.absoluteFill} spacing={PILL_H_MARGIN}>
          {/* Full-bar glass background */}
          <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" />
          {/* Active-tab pill — merges with the bar glass */}
          <GlassView
            style={[styles.pill, { width: pillWidth, left: pillLeft, top: pillTop }]}
            glassEffectStyle="clear"
            isInteractive
          />
        </GlassContainer>
      ) : (
        /* Fallback: BlurView bar + tinted pill */
        <>
          <BlurView
            intensity={80}
            tint="systemChromeMaterial"
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.pill,
              styles.fallbackPill,
              { width: pillWidth, left: pillLeft, top: pillTop },
            ]}
          />
        </>
      )}

      {/* ── Tab item buttons ── */}
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const config    = TAB_CONFIG[route.name];
          const isFocused = state.index === index;
          if (!config) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityLabel={config.label}
              accessibilityState={{ selected: isFocused }}
            >
              <Ionicons
                name={isFocused ? config.iconFocused : config.icon}
                size={24}
                color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
              <Text style={[styles.label, { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: BAR_H_MARGIN,
    right: BAR_H_MARGIN,
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden', // clips the glass layers to the rounded shape
  },
  pill: {
    position: 'absolute',
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
  },
  fallbackPill: {
    backgroundColor: 'rgba(0,122,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,122,255,0.25)',
  },
  tabRow: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
