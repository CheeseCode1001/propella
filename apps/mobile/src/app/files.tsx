import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CourseItem {
  id: string;
  code: string;
  title: string;
  files: {
    id: string;
    name: string;
    type: 'pdf' | 'doc' | 'slides';
    size: string;
    uploadedAt: string;
  }[];
}

export default function FilesScreen() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(1);

  const years = [
    { label: '100 Level', value: 1 },
    { label: '200 Level', value: 2 },
    { label: '300 Level', value: 3 },
    { label: '400 Level', value: 4 },
    { label: '500 Level', value: 5 },
  ];

  const coursesByYear: Record<number, CourseItem[]> = {
    1: [
      {
        id: 'c1',
        code: 'MTH 101',
        title: 'Elementary Mathematics I (Calculus & Algebra)',
        files: [
          { id: 'f1', name: 'MTH101 2024 Exam Past Questions.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '12 Oct' },
          { id: 'f2', name: 'Derivatives & Limits Cheatsheet.pdf', type: 'pdf', size: '1.1 MB', uploadedAt: '08 Oct' },
          { id: 'f3', name: 'Lecture Module 1 to 5.pptx', type: 'slides', size: '5.8 MB', uploadedAt: '28 Sep' },
        ],
      },
      {
        id: 'c2',
        code: 'PHY 101',
        title: 'General Physics I (Mechanics & Properties of Matter)',
        files: [
          { id: 'f4', name: 'PHY101 UNILAG Past Exam 2019-2023.pdf', type: 'pdf', size: '4.2 MB', uploadedAt: '03 Oct' },
          { id: 'f5', name: 'Vectors & Dimensional Analysis.pdf', type: 'pdf', size: '890 KB', uploadedAt: '15 Sep' },
        ],
      },
      {
        id: 'c3',
        code: 'CHM 101',
        title: 'General Chemistry I (Physical & Inorganic)',
        files: [
          { id: 'f6', name: 'CHM101 Solved Model Solutions.pdf', type: 'pdf', size: '3.1 MB', uploadedAt: '19 Sep' },
        ],
      },
    ],
    2: [
      {
        id: 'c4',
        code: 'CSC 201',
        title: 'Computer Programming I (Data Structures)',
        files: [
          { id: 'f7', name: 'CSC201 Departmental Exam 2023.pdf', type: 'pdf', size: '1.8 MB', uploadedAt: '14 Sep' },
        ],
      },
    ],
  };

  const activeCourses = coursesByYear[selectedYear] || [];

  function handleUploadCourse() {
    Alert.alert('Upload Document', 'Select PDF or PPT lecture notes to add to your course vault.');
  }

  function handleOpenFile(name: string) {
    Alert.alert('Course File', `Opening ${name} in study viewer.`);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Palette.ink} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Course Files & Vault</Text>
          <Text style={styles.headerSubtitle}>University lecture notes & past papers</Text>
        </View>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadCourse}>
          <Ionicons name="cloud-upload-outline" size={20} color={Palette.accent} />
        </TouchableOpacity>
      </View>

      {/* Year Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.yearTabsScroll}
      >
        {years.map((y) => {
          const isSelected = selectedYear === y.value;
          return (
            <TouchableOpacity
              key={y.value}
              style={[
                styles.yearPill,
                isSelected && styles.yearPillSelected,
              ]}
              onPress={() => setSelectedYear(y.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.yearPillText,
                  isSelected && styles.yearPillTextSelected,
                ]}
              >
                {y.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeCourses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={44} color={Palette.ink3} />
            <Text style={styles.emptyTitle}>No courses found for this level</Text>
            <Text style={styles.emptySubtitle}>Upload course materials or past questions to build this level's vault.</Text>
            <TouchableOpacity style={styles.addCourseBtn} onPress={handleUploadCourse}>
              <Text style={styles.addCourseBtnText}>Add Course / Files</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeCourses.map((c) => (
            <View key={c.id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{c.code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseTitle}>{c.title}</Text>
                  <Text style={styles.fileCountText}>{c.files.length} documents uploaded</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Files */}
              <View style={styles.filesList}>
                {c.files.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.fileRow}
                    activeOpacity={0.7}
                    onPress={() => handleOpenFile(f.name)}
                  >
                    <View style={styles.fileIconWrap}>
                      <Ionicons
                        name={f.type === 'pdf' ? 'document-text' : 'easel'}
                        size={18}
                        color={Palette.accent}
                      />
                    </View>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                      <Text style={styles.fileMeta}>{f.size} • Uploaded {f.uploadedAt}</Text>
                    </View>
                    <Ionicons name="download-outline" size={18} color={Palette.ink3} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: Palette.ink,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Palette.ink3,
  },
  uploadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearTabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
  },
  yearPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  yearPillSelected: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  yearPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.ink2,
  },
  yearPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  courseCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeBadge: {
    backgroundColor: Palette.accentTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.accent,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
  },
  fileCountText: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.paper2,
  },
  filesList: {
    gap: 8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.paper,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 10,
  },
  fileIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.ink,
  },
  fileMeta: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 1,
  },
  emptyCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  emptyTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: Palette.ink,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.ink3,
    textAlign: 'center',
  },
  addCourseBtn: {
    backgroundColor: Palette.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  addCourseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
