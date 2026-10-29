import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PlaybackControls } from '../components/PlaybackControls';
import {
  extractArrayFromInput,
  generateBubbleSortSteps,
  generateSelectionSortSteps,
} from './sortingSteps';
import { SortingStep, VisualizerProps } from './types';

interface AnimatedBarProps {
  value: number;
  maxValue: number;
  index: number;
  isComparing: boolean;
  isSwapped: boolean;
  isSorted: boolean;
  isHighlighted: boolean;
}

function AnimatedBar({
  value,
  maxValue,
  index,
  isComparing,
  isSwapped,
  isSorted,
  isHighlighted,
}: AnimatedBarProps) {
  const targetHeight = Math.max(28, Math.round((value / maxValue) * 150));
  const animatedHeight = useSharedValue(targetHeight);
  const animatedScale = useSharedValue(1);

  useEffect(() => {
    animatedHeight.value = withTiming(targetHeight, { duration: 240 });
    animatedScale.value = withTiming(isComparing || isSwapped ? 1.06 : 1, {
      duration: 200,
    });
  }, [animatedHeight, animatedScale, isComparing, isSwapped, targetHeight]);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    transform: [{ scale: animatedScale.value }],
  }));

  let barColor = '#3B82F6';
  if (isSwapped) {
    barColor = '#EF4444';
  } else if (isComparing) {
    barColor = '#F59E0B';
  } else if (isHighlighted) {
    barColor = '#8B5CF6';
  } else if (isSorted) {
    barColor = '#10B981';
  }

  return (
    <View style={styles.barColumn}>
      <Text style={styles.barValue}>{value}</Text>
      <Animated.View
        style={[
          styles.bar,
          { backgroundColor: barColor },
          barAnimatedStyle,
        ]}
      />
      <Text style={styles.barIndex}>[{index}]</Text>
    </View>
  );
}

export interface SortingVisualizerComponentProps {
  sampleInput: unknown;
  stepGenerator: (initial: number[]) => SortingStep[];
  defaultArray?: number[];
}

export function SortingVisualizer({
  sampleInput,
  stepGenerator,
  defaultArray = [64, 34, 25, 12, 22, 11, 90],
}: SortingVisualizerComponentProps) {
  const initialArray = useMemo(
    () => extractArrayFromInput(sampleInput, defaultArray),
    [sampleInput, defaultArray]
  );

  const steps = useMemo(
    () => stepGenerator(initialArray),
    [initialArray, stepGenerator]
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
  const maxValue = useMemo(
    () => Math.max(...initialArray, 1),
    [initialArray]
  );

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
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>เปรียบเทียบ</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>สลับค่า</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>ค่าต่ำสุด/โฟกัส</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>เรียงแล้ว</Text>
        </View>
      </View>

      <View style={styles.stage}>
        {step.array.map((val, idx) => (
          <AnimatedBar
            key={idx}
            index={idx}
            value={val}
            maxValue={maxValue}
            isComparing={step.comparing.includes(idx)}
            isSwapped={step.swapped.includes(idx)}
            isSorted={step.sortedIndices.includes(idx)}
            isHighlighted={step.highlightIndex === idx}
          />
        ))}
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

export function BubbleSortVisualizer({ sampleInput }: VisualizerProps) {
  return (
    <SortingVisualizer
      sampleInput={sampleInput}
      stepGenerator={generateBubbleSortSteps}
      defaultArray={[64, 34, 25, 12, 22, 11, 90]}
    />
  );
}

export function SelectionSortVisualizer({ sampleInput }: VisualizerProps) {
  return (
    <SortingVisualizer
      sampleInput={sampleInput}
      stepGenerator={generateSelectionSortSteps}
      defaultArray={[29, 10, 14, 37, 13, 25, 18]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  stage: {
    minHeight: 210,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  barValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  bar: {
    width: '72%',
    maxWidth: 34,
    minWidth: 16,
    borderRadius: 6,
  },
  barIndex: {
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
