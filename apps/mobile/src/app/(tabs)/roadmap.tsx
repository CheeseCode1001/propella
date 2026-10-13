import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts, getSubjectColor } from '@/constants/theme';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { mockRoadmapSubjects } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';

export default function RoadmapScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState(mockRoadmapSubjects);
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState('mathematics');

  React.useEffect(() => {
    async function loadRoadmap() {
      try {
        const res = await api.get<{ data: any }>('/roadmap');
        if (res?.data?.subjects && Array.isArray(res.data.subjects) && res.data.subjects.length > 0) {
          setSubjects(res.data.subjects);
        }
      } catch {
        // Offline fallback
      }
    }
    loadRoadmap();
  }, []);

  const currentSubject =
    subjects.find((s) => s.slug === selectedSubjectSlug) ||
    subjects[0];

  const subjectColor = getSubjectColor(currentSubject.slug);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <MobileTopBar />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Syllabus Roadmap</Text>
        <Text style={styles.headerSubtitle}>
          Master each unit step-by-step for JAMB 2026
        </Text>
      </View>

      {/* Subject Horizontal Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjectTabsScroll}
      >
        {subjects.map((sub) => {
          const isSelected = sub.slug === selectedSubjectSlug;
          const subColor = getSubjectColor(sub.slug);
          return (
            <TouchableOpacity
              key={sub.slug}
              style={[
                styles.subjectTab,
                isSelected && {
                  backgroundColor: subColor,
                  borderColor: subColor,
                },
              ]}
              onPress={() => setSelectedSubjectSlug(sub.slug)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.subjectTabText,
                  isSelected && styles.subjectTabTextActive,
                ]}
              >
                {sub.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Subject Mastery Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroSubjectLabel, { color: subjectColor }]}>
                {currentSubject.name}
              </Text>
              <Text style={styles.heroTopicsCount}>
                {currentSubject.completedCount} of {currentSubject.topicsCount}{' '}
                topics completed
              </Text>
            </View>
            <View style={styles.masteryBadge}>
              <Text style={[styles.masteryNumber, { color: subjectColor }]}>
                {currentSubject.mastery}%
              </Text>
              <Text style={styles.masteryLabel}>Mastery</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${currentSubject.mastery}%`,
                  backgroundColor: subjectColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Units & Topics Accordion / List */}
        <View style={styles.unitsContainer}>
          {currentSubject.units.map((unit, uIdx) => (
            <View key={unit.id} style={styles.unitCard}>
              <View style={styles.unitHeader}>
                <View style={styles.unitHeaderLeft}>
                  <View
                    style={[
                      styles.unitStatusIcon,
                      unit.status === 'completed'
                        ? { backgroundColor: Palette.successTint }
                        : { backgroundColor: Palette.paper2 },
                    ]}
                  >
                    <Ionicons
                      name={
                        unit.status === 'completed'
                          ? 'checkmark-circle'
                          : 'time-outline'
                      }
                      size={18}
                      color={
                        unit.status === 'completed'
                          ? Palette.success
                          : Palette.ink2
                      }
                    />
                  </View>
                  <View>
                    <Text style={styles.unitTitle}>{unit.title}</Text>
                    <Text style={styles.unitStats}>
                      {unit.topics.length} topics • {unit.mastery}% mastered
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.topicDivider} />

              {/* Topics inside unit */}
              <View style={styles.topicsList}>
                {unit.topics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={styles.topicRow}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: '/topic-detail',
                        params: {
                          subjectSlug: currentSubject.slug,
                          title: topic.title,
                        },
                      })
                    }
                  >
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                      <View style={styles.topicMeta}>
                        <View
                          style={[
                            styles.statusBadge,
                            topic.status === 'completed'
                              ? { backgroundColor: Palette.successTint }
                              : topic.status === 'needs-revision'
                              ? { backgroundColor: Palette.warningTint }
                              : { backgroundColor: Palette.paper2 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              topic.status === 'completed'
                                ? { color: Palette.success }
                                : topic.status === 'needs-revision'
                                ? { color: Palette.warning }
                                : { color: Palette.ink2 },
                            ]}
                          >
                            {topic.status === 'completed'
                              ? 'Mastered'
                              : topic.status === 'needs-revision'
                              ? 'Needs Revision'
                              : 'In Progress'}
                          </Text>
                        </View>
                        <Text style={styles.topicMasteryText}>
                          {topic.mastery}%
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.practiceButton}
                      activeOpacity={0.7}
                      onPress={() => router.push('/quizzes')}
                    >
                      <Ionicons
                        name="play"
                        size={12}
                        color={Palette.accent}
                      />
                      <Text style={styles.practiceButtonText}>Practice</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
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
  subjectTabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  subjectTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  subjectTabText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 13,
    fontWeight: '600',
    color: Palette.ink2,
  },
  subjectTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroSubjectLabel: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTopicsCount: {
    fontSize: 13,
    color: Palette.ink3,
    marginTop: 2,
  },
  masteryBadge: {
    alignItems: 'center',
    backgroundColor: Palette.paper2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  masteryNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  masteryLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Palette.ink3,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 8,
    backgroundColor: Palette.paper2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  unitsContainer: {
    gap: 14,
  },
  unitCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    padding: 14,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unitStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: Palette.ink,
  },
  unitStats: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  topicDivider: {
    height: 1,
    backgroundColor: Palette.paper2,
    marginVertical: 12,
  },
  topicsList: {
    gap: 10,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.paper,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 8,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.ink,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  topicMasteryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.ink3,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.accentTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  practiceButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.accent,
  },
});
