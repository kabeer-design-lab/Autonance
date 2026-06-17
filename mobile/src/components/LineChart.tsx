import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../theme';

type Period = '1D' | '1W' | '1M' | '6M' | '1Y';

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
}

function buildPath(pts: { x: number; y: number }[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

function buildArea(pts: { x: number; y: number }[], h: number): string {
  return [
    ...pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
    `L ${pts[pts.length - 1].x} ${h}`,
    `L ${pts[0].x} ${h}`,
    'Z',
  ].join(' ');
}

export function LineChart({ data, width = 300, height = 100 }: LineChartProps) {
  const [period, setPeriod] = useState<Period>('1W');
  const periods: Period[] = ['1D', '1W', '1M', '6M', '1Y'];

  const padX = 2;
  const padY = 8;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + (1 - (v - min) / range) * chartH,
  }));

  return (
    <View style={styles.container}>
      {/* Period tabs — blue on the active one is the only accent here */}
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
          >
            <Text style={[styles.periodLabel, period === p && styles.periodLabelActive]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.07" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={buildArea(pts, height)} fill="url(#lg)" />
        <Path
          d={buildPath(pts)}
          stroke="#000000"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  periodBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodBtnActive: {
    borderColor: colors.primary,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  // Blue makes the active period unmissable without dominating the chart
  periodLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
