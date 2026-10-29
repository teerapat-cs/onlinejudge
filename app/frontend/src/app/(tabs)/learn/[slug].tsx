import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Algorithm, fetchAlgorithmBySlug } from '../../../api';
import { VISUALIZER_REGISTRY } from '../../../visualizers';

export default function AlgorithmDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAlgorithmBySlug(slug);
        if (active) setAlgorithm(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'ไม่พบข้อมูล Algorithm'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !algorithm) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error ?? 'ไม่พบ Algorithm'}</Text>
      </View>
    );
  }

  const VisualizerComponent = VISUALIZER_REGISTRY[algorithm.slug];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{algorithm.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {algorithm.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.complexityRow}>
          <View style={styles.complexityBox}>
            <Text style={styles.complexityLabel}>Time Complexity</Text>
            <Text style={styles.complexityValue}>
              {algorithm.time_complexity ?? '-'}
            </Text>
          </View>
          <View style={styles.complexityBox}>
            <Text style={styles.complexityLabel}>Space Complexity</Text>
            <Text style={styles.complexityValue}>
              {algorithm.space_complexity ?? '-'}
            </Text>
          </View>
        </View>

        {algorithm.description && (
          <Text style={styles.description}>{algorithm.description}</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Animation การทำงาน</Text>
        {VisualizerComponent ? (
          React.createElement(VisualizerComponent, {
            sampleInput: algorithm.sample_input,
          })
        ) : (
          <View style={styles.noAnimBox}>
            <Text style={styles.noAnimText}>ยังไม่มี animation</Text>
          </View>
        )}
      </View>

      {algorithm.pseudocode && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pseudocode</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{algorithm.pseudocode.trim()}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 14,
    gap: 14,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338CA',
  },
  complexityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  complexityBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  complexityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  complexityValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  noAnimBox: {
    padding: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  noAnimText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  codeBlock: {
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 8,
  },
  codeText: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
});
