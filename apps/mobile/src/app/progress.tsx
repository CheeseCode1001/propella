import React from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProgressScreen() {
  const router = useRouter();

  const subjects = [
    { slug: 'english', name: 'Use of English', mastery: 81, questions: 420 },
    { slug: 'mathematics', name: 'Mathematics', mastery: 76, questions: 510 },
    { slug: 'physics', name: 'Physics', mastery: 65, questions: 380 },
    { slug: 'chemistry', name: 'Chemistry', mastery: 58, questions: 290 },
  ];

  const badges = [
    { id: 'b1', title: '7-Day Flame', desc: 'Maintained 7 consecutive active study days', icon: 'flame', unlocked: true, color: Palette.warning },
    { id: 'b2', title: 'Century Quizzer', desc: 'Solved over 100 past questions', icon: 'ribbon', unlocked: true, color: Palette.accent },
    { id: 'b3', title: 'Speed Demon', desc: 'Cleared a 10-question quiz in under 4 minutes', icon: 'flash', unlocked: true, color: '#2F6B6B' },
    { id: 'b4', title: 'Mock Master', desc: 'Completed 3 full mock exam simulations', icon: 'trophy', unlocked: false, color: Palette.ink3 },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Palette.ink} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Progress & Analytics</Text>
          <Text style={styles.headerSubtitle}>Mastery, trends & badges</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Readiness Overview Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroTag}>OVERALL READINESS</Text>
              <Text style={styles.heroScore}>72%</Text>
              <Text style={styles.heroDesc}>Projected score: 285–310 in JAMB</Text>
            </View>
            <View style={styles.heroBadgeIcon}>
              <Ionicons name="analytics" size={32} color={Palette.accent} />
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '72%' }]} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>1,600</Text>
            <Text style={styles.statLbl}>Questions Answered</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>78%</Text>
            <Text style={styles.statLbl}>Average Accuracy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>42h</Text>
            <Text style={styles.statLbl}>Study Time Logged</Text>
          </View>
        </View>

        {/* Subject Mastery Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Subject Mastery</Text>
          <View style={styles.subjectList}>
            {subjects.map((sub) => {
              const subColor = getSubjectColor(sub.slug);
              return (
                <View key={sub.slug} style={styles.subjectRow}>
                  <View style={styles.subjectRowHeader}>
                    <Text style={styles.subName}>{sub.name}</Text>
                    <Text style={[styles.subMastery, { color: subColor }]}>
                      {sub.mastery}%
                    </Text>
                  </View>
                  <View style={styles.subTrack}>
                    <View
                      style={[
                        styles.subFill,
                        { width: `${sub.mastery}%`, backgroundColor: subColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.subQCount}>{sub.questions} questions practiced</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Achievement Badges */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Earned Badges & Milestones</Text>
          <View style={styles.badgesGrid}>
            {badges.map((b) => (
              <View
                key={b.id}
                style={[
                  styles.badgeCard,
                  !b.unlocked && styles.badgeCardLocked,
                ]}
              >
                <View
                  style={[
                    styles.badgeIconWrap,
                    { backgroundColor: `${b.color}15` },
                  ]}
                >
                  <Ionicons name={b.icon as any} size={24} color={b.color} />
                </View>
                <Text style={styles.badgeName}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
    backgroundColor: Palette.paper,
  },
  backButton: {
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
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
  heroTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.accent,
    textTransform: 'uppercase',
  },
  heroScore: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 32,
    fontWeight: '800',
    color: Palette.ink,
    marginTop: 2,
  },
  heroDesc: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  heroBadgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 8,
    backgroundColor: Palette.paper2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.accent,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 18,
    fontWeight: '800',
    color: Palette.ink,
  },
  statLbl: {
    fontSize: 10,
    color: Palette.ink3,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  sectionTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: Palette.ink,
    marginBottom: 12,
  },
  subjectList: {
    gap: 12,
  },
  subjectRow: {
    gap: 4,
  },
  subjectRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subName: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.ink,
  },
  subMastery: {
    fontSize: 13,
    fontWeight: '800',
  },
  subTrack: {
    height: 6,
    backgroundColor: Palette.paper2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  subFill: {
    height: '100%',
    borderRadius: 3,
  },
  subQCount: {
    fontSize: 11,
    color: Palette.ink3,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: Palette.paper,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.ink,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    color: Palette.ink3,
    textAlign: 'center',
    marginTop: 4,
  },
});
