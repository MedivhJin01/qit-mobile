import { StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

interface GlassCardProps extends ViewProps {
  children?: React.ReactNode;
  /** 'regular' looks frosted; 'clear' is more transparent. Defaults to 'regular'. */
  glassStyle?: 'regular' | 'clear';
}

/**
 * A card that uses the native iOS 26 Liquid Glass effect (GlassView) when available,
 * and falls back to a BlurView frosted-glass look on older iOS / Android.
 */
export function GlassCard({ children, style, glassStyle = 'regular', ...props }: GlassCardProps) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView
        style={[styles.card, style]}
        glassEffectStyle={glassStyle}
        {...props}
      >
        {children}
      </GlassView>
    );
  }

  // Fallback: BlurView + semi-transparent overlay
  return (
    <View style={[styles.card, styles.fallback, style]} {...props}>
      <BlurView intensity={70} tint="systemChromeMaterial" style={StyleSheet.absoluteFill} />
      <View style={styles.fallbackOverlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    overflow: 'hidden',
    padding: 16,
  },
  fallback: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
