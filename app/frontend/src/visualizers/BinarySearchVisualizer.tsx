import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PlaybackControls } from '../components/PlaybackControls';
import { BinarySearchStep, VisualizerProps } from './types';

function parseBinarySearchInput(sampleInput: unknown): {
  array: number[];
  target: number;
} {
  const defaultArray = [3, 8, 12, 17, 23, 31, 42, 56, 68, 79];
  const defaultTarget = 42;

  if (sampleInput && typeof sampleInput === 'object') {
    const rec = sampleInput as Record<string, unknown>;
    const rawArr = Array.isArray(rec.array)
      ? rec.array.map(Number).filter((n) => !Number.isNaN(n))
      : [];
    const sorted =
      rawArr.length > 0 ? [...rawArr].sort((a, b) => a - b) : defaultArray;
    const target =
      typeof rec.target === 'number' && !Number.isNaN(rec.target)
        ? rec.target
        : defaultTarget;
    return { array: sorted, target };
  }

  return { array: defaultArray, target: defaultTarget };
}

function generateBinarySearchSteps(
  array: number[],
  target: number
): BinarySearchStep[] {
  const steps: BinarySearchStep[] = [];
  let low = 0;
  let high = array.length - 1;
  const eliminated = new Set<number>();

  steps.push({
    array,
    target,
    low,
    mid: null,
    high,
    foundIndex: null,
    eliminatedIndices: [],
    description: `เริ่มต้นค้นหาค่า target = ${target} ในช่วง index [${low}..${high}]`,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({
      array,
      target,
      low,
      mid,
      high,
      foundIndex: null,
      eliminatedIndices: Array.from(eliminated),
      description: `คำนวณ mid = floor((${low} + ${high}) / 2) = ${mid} → arr[${mid}] = ${array[mid]}`,
    });

    if (array[mid] === target) {
      steps.push({
        array,
        target,
        low,
        mid,
        high,
        foundIndex: mid,
        eliminatedIndices: Array.from(eliminated),
        description: `พบค่า target = ${target} ที่ตำแหน่ง index ${mid}!`,
      });
      return steps;
    }

    if (array[mid] < target) {
      for (let i = low; i <= mid; i++) {
        eliminated.add(i);
      }
      low = mid + 1;
      steps.push({
        array,
        target,
        low,
        mid: null,
        high,
        foundIndex: null,
        eliminatedIndices: Array.from(eliminated),
        description: `arr[${mid}] = ${array[mid]} < ${target} → ตัดครึ่งซ้ายทิ้ง เลื่อน low = ${low}`,
      });
    } else {
      for (let i = mid; i <= high; i++) {
        eliminated.add(i);
      }
      high = mid - 1;
      steps.push({
        array,
        target,
        low,
        mid: null,
        high,
        foundIndex: null,
        eliminatedIndices: Array.from(eliminated),
        description: `arr[${mid}] = ${array[mid]} > ${target} → ตัดครึ่งขวาทิ้ง เลื่อน high = ${high}`,
      });
    }
  }

  steps.push({
    array,
    target,
    low,
    mid: null,
    high,
    foundIndex: null,
    eliminatedIndices: Array.from(eliminated),
    description: `ไม่พบค่า ${target} ในอาเรย์ (low > high)`,
  });

  return steps;
}

interface CellProps {
  value: number;
  index: number;
  isLow: boolean;
  isMid: boolean;
  isHigh: boolean;
  isFound: boolean;
  isEliminated: boolean;
}

function AnimatedCell({
  value,
  index,
  isLow,
  isMid,
  isHigh,
  isFound,
  isEliminated,
}: CellProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(isEliminated ? 0.32 : 1, { duration: 240 });
    scale.value = withTiming(isFound || isMid ? 1.08 : 1, { duration: 220 });
  }, [isEliminated, isFound, isMid, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  let bg = '#1E293B';
  let borderColor = '#475569';
  if (isFound) {
    bg = '#10B981';
    borderColor = '#059669';
  } else if (isMid) {
    bg = '#F59E0B';
    borderColor = '#D97706';
  } else if (isLow || isHigh) {
    bg = '#2563EB';
    borderColor = '#60A5FA';
  }

  const pointers: string[] = [];
  if (isLow) pointers.push('L');
  if (isMid) pointers.push('M');
  if (isHigh) pointers.push('H');

  return (
    <Animated.View style={[styles.cellWrapper, animatedStyle]}>
      <View style={styles.pointerRow}>
        {pointers.length > 0 ? (
          <View style={styles.pointerBadge}>
            <Text style={styles.pointerText}>{pointers.join('/')}</Text>
          </View>
        ) : (
          <View style={styles.pointerPlaceholder} />
        )}
      </View>
      <View style={[styles.cellBox, { backgroundColor: bg, borderColor }]}>
        <Text style={styles.cellValue}>{value}</Text>
      </View>
      <Text style={styles.cellIndex}>[{index}]</Text>
    </Animated.View>
  );
}

export function BinarySearchVisualizer({ sampleInput }: VisualizerProps) {
  const { array, target } = useMemo(
    () => parseBinarySearchInput(sampleInput),
    [sampleInput]
  );

  const steps = useMemo(
    () => generateBinarySearchSteps(array, target),
    [array, target]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(650);

  const safeStepIndex = Math.min(currentStep, Math.max(0, steps.length - 1));

  useEffect(() => {
    if (!isPlaying || safeStepIndex >= steps.length - 1) return;
    const timer = setTimeout(() => {
      const next = Math.min(safeStepIndex + 1, steps.length - 1);
      setCurrentStep(next);
      if (next >= steps.length - 1) {
        setIsPlaying(false);
      }
    }, speedMs);
    return () => clearTimeout(timer);
  }, [isPlaying, safeStepIndex, steps.length, speedMs]);

  const step = steps[safeStepIndex] ?? steps[0];

  const handlePlayPause = () => {
    if (safeStepIndex >= steps.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.targetLabel}>ค่าเป้าหมาย (Target): {target}</Text>
        <Text style={styles.rangeLabel}>
          low={step.low} · mid={step.mid ?? '-'} · high={step.high}
        </Text>
      </View>

      <View style={styles.stage}>
        <View style={styles.cellsGrid}>
          {step.array.map((val, idx) => (
            <AnimatedCell
              key={idx}
              value={val}
              index={idx}
              isLow={step.low === idx && step.low <= step.high}
              isMid={step.mid === idx}
              isHigh={step.high === idx && step.low <= step.high}
              isFound={step.foundIndex === idx}
              isEliminated={step.eliminatedIndices.includes(idx)}
            />
          ))}
        </View>
      </View>

      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionText}>{step.description}</Text>
      </View>

      <PlaybackControls
        currentStep={safeStepIndex}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        speedMs={speedMs}
        onPlayPause={handlePlayPause}
        onStepForward={() => {
          setIsPlaying(false);
          setCurrentStep(Math.min(safeStepIndex + 1, steps.length - 1));
        }}
        onStepBackward={() => {
          setIsPlaying(false);
          setCurrentStep(Math.max(safeStepIndex - 1, 0));
        }}
        onReset={() => {
          setIsPlaying(false);
          setCurrentStep(0);
        }}
        onChangeSpeed={setSpeedMs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  targetLabel: {
    fontWeight: '700',
    fontSize: 13,
    color: '#0F172A',
  },
  rangeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  stage: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
  },
  cellsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  cellWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  pointerRow: {
    height: 20,
    justifyContent: 'center',
  },
  pointerBadge: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointerPlaceholder: {
    height: 18,
  },
  pointerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  cellBox: {
    width: 46,
    height: 46,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellValue: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  cellIndex: {
    color: '#94A3B8',
    fontSize: 11,
  },
  descriptionBox: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
  },
  descriptionText: {
    color: '#1E3A8A',
    fontSize: 13,
    fontWeight: '600',
  },
});
