import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { category, CategoryName, colors, typography, spacing } from '../theme';

export interface DonutSlice {
  categoryName: CategoryName;
  amount: number;
}

interface DonutChartProps {
  data: DonutSlice[];
  total: number;
  size?: number;
  currency?: string;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, outerR: number, innerR: number, start: number, end: number) {
  const large = end - start > 180 ? 1 : 0;
  const o1 = polarToXY(cx, cy, outerR, start);
  const o2 = polarToXY(cx, cy, outerR, end);
  const i1 = polarToXY(cx, cy, innerR, end);
  const i2 = polarToXY(cx, cy, innerR, start);
  return `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
}

export function DonutChart({ data, total, size = 200, currency = '₹' }: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.66;

  let cum = 0;
  const slices = data.map((s) => {
    const sweep = (s.amount / total) * 358;
    const start = cum;
    cum += sweep;
    return { ...s, start, sweep };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        <Svg width={size} height={size}>
          {slices.map((s, i) => (
            <Path
              key={i}
              d={slicePath(cx, cy, outerR, innerR, s.start, s.start + s.sweep)}
              fill={category[s.categoryName].color}
            />
          ))}
        </Svg>
        <View style={[styles.center, { width: innerR * 2 - 8, height: innerR * 2 - 8, borderRadius: innerR }]}>
          <Text style={styles.centerLabel}>Total</Text>
          <Text style={styles.centerAmount}>{currency}{total.toLocaleString('en-IN')}</Text>
        </View>
      </View>
      <View style={styles.legend}>
        {data.map((s) => (
          <View key={s.categoryName} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: category[s.categoryName].color }]} />
            <Text style={styles.legendName}>{s.categoryName}</Text>
            <Text style={styles.legendPct}>
              {Math.round((s.amount / total) * 100)}%
            </Text>
            <Text style={styles.legendAmount}>{currency}{s.amount.toLocaleString('en-IN')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  centerLabel: {
    ...(typography.caption as object),
    color: colors.textMuted,
  },
  centerAmount: {
    ...(typography.h3 as object),
    color: colors.textPrimary,
  },
  legend: {
    width: '100%',
    gap: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    ...(typography.label as object),
    color: colors.textSecondary,
    flex: 1,
  },
  legendPct: {
    ...(typography.caption as object),
    color: colors.textMuted,
    width: 32,
    textAlign: 'right',
  },
  legendAmount: {
    ...(typography.amountSm as object),
    color: colors.textPrimary,
    width: 80,
    textAlign: 'right',
  },
});
