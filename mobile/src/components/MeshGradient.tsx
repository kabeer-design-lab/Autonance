import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

function useBlob(startX: number, startY: number, endX: number, endY: number, duration: number) {
  const x = useRef(new Animated.Value(startX)).current;
  const y = useRef(new Animated.Value(startY)).current;

  useEffect(() => {
    const loopX = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: endX, duration, useNativeDriver: true, easing: t => Math.sin(t * Math.PI) }),
        Animated.timing(x, { toValue: startX, duration, useNativeDriver: true, easing: t => Math.sin(t * Math.PI) }),
      ])
    );
    const loopY = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: endY, duration: duration * 1.3, useNativeDriver: true, easing: t => Math.sin(t * Math.PI) }),
        Animated.timing(y, { toValue: startY, duration: duration * 1.3, useNativeDriver: true, easing: t => Math.sin(t * Math.PI) }),
      ])
    );
    loopX.start();
    loopY.start();
    return () => { loopX.stop(); loopY.stop(); };
  }, []);

  return { x, y };
}

interface MeshGradientProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function MeshGradient({ style, children }: MeshGradientProps) {
  // Three animated blobs — different sizes, colors, speeds
  const blob1 = useBlob(-60, H * 0.42, W * 0.1, H * 0.58, 5200);
  const blob2 = useBlob(W * 0.3, H * 0.52, W * 0.5, H * 0.72, 6800);
  const blob3 = useBlob(W * 0.55, H * 0.48, W * 0.2, H * 0.65, 4600);
  const blob4 = useBlob(W * 0.6, H * 0.6, W * 0.75, H * 0.78, 7400);

  return (
    <View style={[styles.container, style]}>
      {/* White base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />

      {/* Blob 1 — royal blue, large, lower-left */}
      <Animated.View
        style={[
          styles.blob,
          { width: 340, height: 340, borderRadius: 170, backgroundColor: 'rgba(0,100,255,0.28)' },
          { transform: [{ translateX: blob1.x }, { translateY: blob1.y }] },
        ]}
      />

      {/* Blob 2 — sky blue, center */}
      <Animated.View
        style={[
          styles.blob,
          { width: 280, height: 260, borderRadius: 140, backgroundColor: 'rgba(50,180,255,0.22)' },
          { transform: [{ translateX: blob2.x }, { translateY: blob2.y }] },
        ]}
      />

      {/* Blob 3 — indigo/violet, right-center */}
      <Animated.View
        style={[
          styles.blob,
          { width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(90,60,255,0.18)' },
          { transform: [{ translateX: blob3.x }, { translateY: blob3.y }] },
        ]}
      />

      {/* Blob 4 — cyan accent, bottom-right */}
      <Animated.View
        style={[
          styles.blob,
          { width: 200, height: 180, borderRadius: 100, backgroundColor: 'rgba(0,200,240,0.20)' },
          { transform: [{ translateX: blob4.x }, { translateY: blob4.y }] },
        ]}
      />

      {/* Gradient overlay: hard white at top fading to transparent so blobs show below */}
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']}
        locations={[0, 0.28, 0.44, 0.62]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Bottom tint to saturate the gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,80,220,0.12)', 'rgba(0,60,200,0.22)']}
        locations={[0.5, 0.8, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
});
