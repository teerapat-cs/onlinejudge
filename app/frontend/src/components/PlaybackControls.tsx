import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMs: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onChangeSpeed: (speedMs: number) => void;
}

const SPEED_OPTIONS = [
  { label: '0.5x', ms: 1100 },
  { label: '1x', ms: 650 },
  { label: '2x', ms: 320 },
];

export function PlaybackControls({
  currentStep,
  totalSteps,
  isPlaying,
  speedMs,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onChangeSpeed,
}: PlaybackControlsProps) {
  const maxStepIndex = Math.max(0, totalSteps - 1);
  const progressRatio = maxStepIndex > 0 ? currentStep / maxStepIndex : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        <Text style={styles.stepLabel}>
          ขั้นตอน {currentStep + 1} / {Math.max(1, totalSteps)}
        </Text>
        <View style={styles.speedRow}>
          {SPEED_OPTIONS.map((option) => {
            const active = speedMs === option.ms;
            return (
              <Pressable
                key={option.label}
                style={[styles.speedBadge, active && styles.speedBadgeActive]}
                onPress={() => onChangeSpeed(option.ms)}
              >
                <Text
                  style={[
                    styles.speedBadgeText,
                    active && styles.speedBadgeTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, Math.round(progressRatio * 100))}%` },
          ]}
        />
      </View>

      <View style={styles.buttonsRow}>
        <Pressable style={styles.secondaryButton} onPress={onReset}>
          <Text style={styles.secondaryButtonText}>↺ Reset</Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            currentStep <= 0 && styles.buttonDisabled,
          ]}
          disabled={currentStep <= 0}
          onPress={onStepBackward}
        >
          <Text style={styles.secondaryButtonText}>◀ Prev</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={onPlayPause}>
          <Text style={styles.primaryButtonText}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            currentStep >= maxStepIndex && styles.buttonDisabled,
          ]}
          disabled={currentStep >= maxStepIndex}
          onPress={onStepForward}
        >
          <Text style={styles.secondaryButtonText}>Next ▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  speedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  speedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  speedBadgeActive: {
    backgroundColor: '#2563EB',
  },
  speedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  speedBadgeTextActive: {
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  primaryButton: {
    flex: 1.3,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});

