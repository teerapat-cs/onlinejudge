import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createNote,
  fetchNote,
  NoteStatus,
  updateNote,
} from '../../../api';

const STATUS_CHOICES: { label: string; value: NoteStatus }[] = [
  { label: 'Open', value: 'open' },
  { label: 'Solved', value: 'solved' },
  { label: 'Revisit', value: 'revisit' },
];

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [problemRef, setProblemRef] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<NoteStatus>('open');
  const [content, setContent] = useState('');

  const [loadingExisting, setLoadingExisting] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        setLoadingExisting(true);
        const existing = await fetchNote(id);
        if (!active) return;
        setTitle(existing.title);
        setPlatform(existing.platform ?? '');
        setProblemRef(existing.problem_ref ?? '');
        setTags(existing.tags ?? '');
        setStatus(existing.status);
        setContent(existing.content);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูล Note ได้'
          );
        }
      } finally {
        if (active) setLoadingExisting(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('กรุณากรอกชื่อโจทย์ (Title)');
      return;
    }
    if (!content.trim()) {
      setError('กรุณากรอกเนื้อหา Note (Markdown)');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        title: title.trim(),
        platform: platform.trim() ? platform.trim() : null,
        problem_ref: problemRef.trim() ? problemRef.trim() : null,
        tags: tags.trim() ? tags.trim() : null,
        status,
        content: content.trim(),
      };

      if (isEditing && id) {
        const updated = await updateNote(id, payload);
        router.replace(`/(tabs)/notes/${updated.id}`);
      } else {
        const created = await createNote(payload);
        router.replace(`/(tabs)/notes/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.formContainer}
      keyboardShouldPersistTaps="handled"
    >
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>ชื่อโจทย์ (Title) *</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น Two Sum, Dijkstra Shortest Path"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.rowFields}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Platform</Text>
          <TextInput
            style={styles.input}
            placeholder="beecrowd, aizu, spoj..."
            value={platform}
            onChangeText={setPlatform}
          />
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>เลขข้อ / URL</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น 1001, ALDS1_1_A"
            value={problemRef}
            onChangeText={setProblemRef}
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>สถานะ (Status)</Text>
        <View style={styles.statusRow}>
          {STATUS_CHOICES.map((choice) => {
            const active = status === choice.value;
            return (
              <Pressable
                key={choice.value}
                style={[styles.statusOption, active && styles.statusOptionActive]}
                onPress={() => setStatus(choice.value)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    active && styles.statusOptionTextActive,
                  ]}
                >
                  {choice.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Tags (คั่นด้วยลูกน้ำ ,)</Text>
        <TextInput
          style={styles.input}
          placeholder="dp, graph, greedy"
          value={tags}
          onChangeText={setTags}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>เนื้อหา Note (รองรับ Markdown) *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={'# แนวคิด\nอธิบายแนวทางการแก้โจทย์และ Time Complexity...'}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.submitRow}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>ยกเลิก</Text>
        </Pressable>

        <Pressable
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving
              ? 'กำลังบันทึก...'
              : isEditing
                ? 'บันทึกการแก้ไข'
                : 'สร้าง Note'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  formContainer: {
    padding: 16,
    gap: 14,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 6,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 170,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  submitRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14,
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

