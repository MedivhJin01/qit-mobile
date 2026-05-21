import { StyleSheet, View } from 'react-native';

/**
 * Colorful blob background — gives the liquid glass effect something to refract.
 */
export function VibrantBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.blob, styles.blobPurple]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobTeal]} />
      <View style={[styles.blob, styles.blobOrange]} />
      <View style={[styles.blob, styles.blobPink]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  blobPurple: {
    width: 320,
    height: 320,
    backgroundColor: '#6E5CE6',
    top: -80,
    left: -60,
  },
  blobBlue: {
    width: 280,
    height: 280,
    backgroundColor: '#0A84FF',
    top: 120,
    right: -80,
  },
  blobTeal: {
    width: 260,
    height: 260,
    backgroundColor: '#30D158',
    bottom: 160,
    left: -40,
  },
  blobOrange: {
    width: 240,
    height: 240,
    backgroundColor: '#FF9F0A',
    bottom: 80,
    right: -40,
  },
  blobPink: {
    width: 200,
    height: 200,
    backgroundColor: '#FF375F',
    top: '40%',
    left: '25%',
  },
});
