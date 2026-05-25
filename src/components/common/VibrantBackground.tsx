import { StyleSheet, View } from 'react-native';

/**
 * Subtle pastel-blob background for light mode.
 * Keeps enough colour saturation for the iOS 26 Liquid Glass to refract
 * beautifully without overpowering content.
 */
export function VibrantBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.blob, styles.blobPurple]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobGreen]} />
      <View style={[styles.blob, styles.blobPeach]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  // Soft lavender — top-left
  blobPurple: {
    width: 400,
    height: 400,
    backgroundColor: '#BF5AF2',
    opacity: 0.2,
    top: -140,
    left: -110,
  },
  // Sky blue — top-right
  blobBlue: {
    width: 340,
    height: 340,
    backgroundColor: '#0A84FF',
    opacity: 0.16,
    top: 60,
    right: -110,
  },
  // Mint green — mid-left
  blobGreen: {
    width: 300,
    height: 300,
    backgroundColor: '#30D158',
    opacity: 0.13,
    bottom: 220,
    left: -70,
  },
  // Warm peach — bottom-right
  blobPeach: {
    width: 280,
    height: 280,
    backgroundColor: '#FF9F0A',
    opacity: 0.13,
    bottom: 80,
    right: -70,
  },
});
