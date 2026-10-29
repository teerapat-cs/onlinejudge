import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { deleteNote, fetchNote, Note } from '../../../api';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadNote = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNote(id);
      setNote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่พบข้อมูล Note');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadNote();
    }, [loadNote])
  );

  const handleDelete = async () => {
    if (!note || deleting) return;
    try {
      setDeleting(true);
      await deleteNote(note.id);
      router.replace('/(tabs)/notes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบ Note ไม่สำเร็จ');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !note) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error ?? 'ไม่พบ Note'}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>กลับ</Text>
        </Pressable>
      </View>
    );
  }

  const tags = note.tags
    ? note.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{note.title}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{note.status.toUpperCase()}</Text>
          </View>
        </View>

        {(note.platform || note.problem_ref) && (
          <Text style={styles.platformText}>
            Platform: {note.platform ?? '-'} · ข้อ/Ref: {note.problem_ref ?? '-'}
          </Text>
        )}

        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push(`/(tabs)/notes/editor?id=${encodeURIComponent(String(note.id))}`)
            }
          >
            <Text style={styles.editButtonText}>แก้ไข Note</Text>
          </Pressable>

          <Pressable
            style={[styles.deleteButton, deleting && styles.disabledBtn]}
            disabled={deleting}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>
              {deleting ? 'กำลังลบ...' : 'ลบ Note'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.markdownCard}>
        <Text style={styles.sectionLabel}>บันทึกแนวคิด / โค้ด (Markdown)</Text>
        <Markdown style={markdownStyles}>{note.content}</Markdown>
      </View>
    </ScrollView>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 6,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: '#F1F5F9',
    color: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  fence: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
});

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
    gap: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  platformText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  markdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
});

