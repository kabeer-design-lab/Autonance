import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
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

function slicePath(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) {
  const large = endAngle - startAngle > 180 ? 1 : 0;
  const o1 = polarToXY(cx, cy, outerR, startAngle);
  const o2 = polarToXY(cx, cy, outerR, endAngle);
  const i1 = polarToXY(cx, cy, innerR, endAngle);
  const i2 = polarToXY(cx, cy, innerR, startAngle);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export function DonutChart({ data, total, size = 200, currency = '₹' }: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.65;

  let cumAngle = 0;
  const slices = data.map((slice) => {
    const sweep = (slice.amount / total) * 360;
    const start = cumAngle;
    cumAngle += sweep;
    return { ...slice, start, sweep };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size}>
          {slices.map((s, i) => (
            <Path
              key={i}
              d={slicePath(cx, cy, outerR, innerR, s.start, s.start + s.sweep - 1)}
              fill={category[s.categoryName].color}
            />
          ))}
          {/* Center hole */}
          <Circle cx={cx} cy={cy} r={innerR - 4} fill={colors.background} />
        </Svg>
        <View style={[styles.center, { width: innerR * 2, height: innerR * 2, borderRadius: innerR }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{currency}{total.toLocaleString('en-IN')}</Text>
        </View>
      </View>
      <View style={styles.legend}>
        {data.map((slice) => (
          <View key={slice.categoryName} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: category[slice.categoryName].color }]} />
            <Text style={styles.legendName}>{slice.categoryName}</Text>
            <Text style={styles.legendAmount}>
              {currency}{slice.amount.toLocaleString('en-IN')}
            </Text>
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
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    ...(typography.caption as object),
    color: colors.textMuted,
  },
  totalAmount: {
    ...(typography.h3 as object),
    color: colors.textPrimary,
  },
  legend: {
    width: '100%',
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    ...(typography.label as object),
    color: colors.textSecondary,
    flex: 1,
  },
  legendAmount: {
    ...(typography.amountSm as object),
    color: colors.textPrimary,
  },
});
