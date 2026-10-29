import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Algorithm, fetchAlgorithms } from '../../../api';
import { getVisualizer } from '../../../visualizers';

export default function AlgorithmListScreen() {
  const router = useRouter();
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlgorithms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAlgorithms();
      setAlgorithms(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ไม่สามารถโหลดรายการ Algorithm ได้'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlgorithms();
    }, [loadAlgorithms])
  );

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.mutedText}>กำลังโหลด Algorithm Catalog...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadAlgorithms}>
          <Text style={styles.retryButtonText}>ลองใหม่</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={algorithms}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.listContent}
        onRefresh={loadAlgorithms}
        refreshing={loading}
        renderItem={({ item }) => {
          const hasVisualizer = Boolean(getVisualizer(item.slug));
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/(tabs)/learn/${item.slug}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>
              </View>

              {item.description && (
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={styles.metaRow}>
                {item.time_complexity && (
                  <View style={styles.complexityPill}>
                    <Text style={styles.complexityText}>
                      Time: {item.time_complexity}
                    </Text>
                  </View>
                )}
                {item.space_complexity && (
                  <View style={styles.complexityPill}>
                    <Text style={styles.complexityText}>
                      Space: {item.space_complexity}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.animBadge,
                    !hasVisualizer && styles.animBadgeMissing,
                  ]}
                >
                  <Text
                    style={[
                      styles.animBadgeText,
                      !hasVisualizer && styles.animBadgeTextMissing,
                    ]}
                  >
                    {hasVisualizer ? '▶ มี Animation' : 'ยังไม่มี animation'}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  mutedText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 14,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
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
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  complexityPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  complexityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  animBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  animBadgeMissing: {
    backgroundColor: '#F1F5F9',
  },
  animBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  animBadgeTextMissing: {
    color: '#64748B',
  },
});

