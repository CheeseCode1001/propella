import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts, getSubjectColor } from '@/constants/theme';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { mockStudyNotes, type StudyNote } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [notes, setNotes] = useState(mockStudyNotes);

  const subjects = [
    { label: 'All Subjects', slug: 'all' },
    { label: 'Mathematics', slug: 'mathematics' },
    { label: 'Physics', slug: 'physics' },
    { label: 'English', slug: 'english' },
    { label: 'Chemistry', slug: 'chemistry' },
  ];

  const filteredNotes = notes.filter((n) => {
    const matchesSubject =
      selectedSubject === 'all' || n.subjectSlug === selectedSubject;
    const matchesSearch =
      n.topicTitle.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase()) ||
      n.subjectName.toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  function toggleBookmark(id: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, bookmarked: !n.bookmarked } : n))
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <MobileTopBar />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Notes & Cheatsheets</Text>
        <Text style={styles.headerSubtitle}>
          High-yield formulas, summaries, and exam tips
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Palette.ink3} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search formulas, laws, or topics..."
            placeholderTextColor={Palette.ink3}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Palette.ink3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Subject Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {subjects.map((sub) => {
          const isSelected = sub.slug === selectedSubject;
          return (
            <TouchableOpacity
              key={sub.slug}
              style={[
                styles.filterPill,
                isSelected && styles.filterPillActive,
              ]}
              onPress={() => setSelectedSubject(sub.slug)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isSelected && styles.filterPillTextActive,
                ]}
              >
                {sub.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Notes Cards Feed */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={Palette.ink3} />
            <Text style={styles.emptyTitle}>No notes found</Text>
            <Text style={styles.emptySubtitle}>Try searching for another keyword</Text>
          </View>
        ) : (
          filteredNotes.map((note) => {
            const subjectColor = getSubjectColor(note.subjectSlug);
            return (
              <View key={note.id} style={styles.noteCard}>
                {/* Note Header */}
                <View style={styles.noteHeader}>
                  <View style={styles.noteHeaderLeft}>
                    <View
                      style={[
                        styles.subjectTagBadge,
                        { backgroundColor: `${subjectColor}15` },
                      ]}
                    >
                      <Text style={[styles.subjectTagText, { color: subjectColor }]}>
                        {note.subjectName}
                      </Text>
                    </View>
                    <Text style={styles.noteTopicTitle}>{note.topicTitle}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => toggleBookmark(note.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={note.bookmarked ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={note.bookmarked ? Palette.accent : Palette.ink3}
                    />
                  </TouchableOpacity>
                </View>

                {/* Summary */}
                <Text style={styles.noteSummary}>{note.summary}</Text>

                {/* Key Points */}
                <View style={styles.keyPointsBox}>
                  <Text style={styles.boxLabel}>Key Concepts:</Text>
                  {note.keyPoints.map((pt, idx) => (
                    <View key={idx} style={styles.pointRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.pointText}>{pt}</Text>
                    </View>
                  ))}
                </View>

                {/* Formulas if any */}
                {note.formulas && note.formulas.length > 0 && (
                  <View style={styles.formulasBox}>
                    <Text style={styles.boxLabel}>Core Formulas:</Text>
                    {note.formulas.map((f, fIdx) => (
                      <View key={fIdx} style={styles.formulaPill}>
                        <Text style={styles.formulaText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Exam Tip Alert */}
                <View style={styles.tipBox}>
                  <Ionicons name="bulb-outline" size={16} color={Palette.warning} />
                  <Text style={styles.tipText}>
                    <Text style={styles.tipBold}>JAMB Tip: </Text>
                    {note.examTips}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: Palette.ink,
  },
  headerSubtitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 13,
    color: Palette.ink3,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.ink,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  filterPillActive: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.ink2,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.ink,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.ink3,
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    padding: 16,
    gap: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  subjectTagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectTagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  noteTopicTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 17,
    fontWeight: '700',
    color: Palette.ink,
  },
  bookmarkButton: {
    padding: 4,
  },
  noteSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.ink2,
  },
  keyPointsBox: {
    backgroundColor: Palette.paper,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 6,
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.ink3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.accent,
    marginTop: 6,
  },
  pointText: {
    fontSize: 12,
    color: Palette.ink,
    flex: 1,
    lineHeight: 18,
  },
  formulasBox: {
    gap: 6,
  },
  formulaPill: {
    backgroundColor: Palette.paper2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  formulaText: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 12,
    fontWeight: '600',
    color: Palette.accent,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Palette.warningTint,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F9E4C8',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#7D5215',
  },
  tipBold: {
    fontWeight: '700',
  },
});
