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

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

function buildArea(points: { x: number; y: number }[], h: number): string {
  if (points.length < 2) return '';
  return [
    ...points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${h}`,
    `L ${points[0].x} ${h}`,
    'Z',
  ].join(' ');
}

export function LineChart({ data, width = 300, height = 100 }: LineChartProps) {
  const [period, setPeriod] = useState<Period>('1W');
  const periods: Period[] = ['1D', '1W', '1M', '6M', '1Y'];

  const padX = 2;
  const padY = 6;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + (1 - (v - min) / range) * chartH,
  }));

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.12" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={buildArea(points, height)} fill="url(#lineGrad)" />
        <Path
          d={buildPath(points)}
          stroke={colors.primary}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  periodBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  periodBtnActive: {
    backgroundColor: colors.surfaceOffset,
  },
  periodLabel: {
    ...(typography.caption as object),
    fontWeight: '500',
    color: colors.textMuted,
  },
  periodLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
