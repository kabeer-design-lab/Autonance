import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../theme';

type Period = '1W' | '1M' | '3M' | '1Y';

interface LineChartProps {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  currency?: string;
}

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return d;
}

function buildArea(points: { x: number; y: number }[], height: number): string {
  if (points.length < 2) return '';
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
}

export function LineChart({ data, width = 300, height = 100, currency = '₹' }: LineChartProps) {
  const [period, setPeriod] = useState<Period>('1M');
  const periods: Period[] = ['1W', '1M', '3M', '1Y'];

  const padX = 4;
  const padY = 8;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + (1 - (v - min) / range) * chartH,
  }));

  const linePath = buildPath(points);
  const areaPath = buildArea(points, height);

  return (
    <View style={styles.container}>
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
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.15" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#grad)" />
        <Path d={linePath} stroke={colors.primary} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  periodBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceOffset,
  },
  periodBtnActive: {
    backgroundColor: colors.primaryLight,
  },
  periodLabel: {
    ...(typography.caption as object),
    color: colors.textMuted,
    fontWeight: '500',
  },
  periodLabelActive: {
    color: colors.primary,
  },
});
