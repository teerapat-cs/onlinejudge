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

import { fetchNotes, Note, NoteStatus } from '../../../api';

const STATUS_FILTERS: { label: string; value: 'all' | NoteStatus }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Solved', value: 'solved' },
  { label: 'Revisit', value: 'revisit' },
];

function getStatusBadgeStyle(status: NoteStatus) {
  switch (status) {
    case 'solved':
      return { bg: '#DCFCE7', text: '#166534', label: 'Solved' };
    case 'revisit':
      return { bg: '#FEF3C7', text: '#92400E', label: 'Revisit' };
    default:
      return { bg: '#DBEAFE', text: '#1E40AF', label: 'Open' };
  }
}

export default function NotesListScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | NoteStatus>('all');

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ไม่สามารถโหลดรายการ Note ได้'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const filteredNotes =
    statusFilter === 'all'
      ? notes
      : notes.filter((n) => n.status === statusFilter);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <Pressable
                key={f.value}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setStatusFilter(f.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={styles.createButton}
          onPress={() => router.push('/(tabs)/notes/editor')}
        >
          <Text style={styles.createButtonText}>+ สร้าง Note</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.mutedText}>กำลังโหลดรายการ Note...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadNotes}>
            <Text style={styles.retryButtonText}>ลองใหม่</Text>
          </Pressable>
        </View>
      ) : filteredNotes.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyTitle}>ยังไม่มี Note ในหมวดนี้</Text>
          <Text style={styles.mutedText}>
            กดปุ่ม &ldquo;+ สร้าง Note&rdquo; เพื่อเริ่มจดบันทึกโจทย์ Online Judge
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onRefresh={loadNotes}
          refreshing={loading}
          renderItem={({ item }) => {
            const badge = getStatusBadgeStyle(item.status);
            const tagList = item.tags
              ? item.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [];
            return (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/(tabs)/notes/${item.id}`)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View
                    style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                  >
                    <Text
                      style={[styles.statusBadgeText, { color: badge.text }]}
                    >
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {(item.platform || item.problem_ref) && (
                  <Text style={styles.metaText}>
                    {[item.platform, item.problem_ref]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                )}

                <Text style={styles.previewText} numberOfLines={2}>
                  {item.content}
                </Text>

                {tagList.length > 0 && (
                  <View style={styles.tagsRow}>
                    {tagList.map((tag) => (
                      <View key={tag} style={styles.tagPill}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  mutedText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
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
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  previewText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
});

