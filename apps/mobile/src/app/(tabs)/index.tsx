import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts, getSubjectColor } from '@/constants/theme';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { mockDashboardData } from '@/lib/mock-data';
import type { TodayTopic } from '@propella/shared';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api-client';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [data, setData] = useState(mockDashboardData);
  const [refreshing, setRefreshing] = useState(false);

  // Redirection guard for Auth & Onboarding
  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !user) {
      router.replace('/(auth)/login');
    } else if (!user.onboardingCompleted) {
      router.replace('/(onboarding)/onboarding');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  const loadDashboard = React.useCallback(async () => {
    try {
      const res = await api.get<{ data: any }>('/dashboard');
      if (res?.data) {
        setData((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch {
      // Offline fallback: keep mockDashboardData
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, loadDashboard]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboard().finally(() => {
      setRefreshing(false);
    });
  }, [loadDashboard]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Refined Web Mobile Top Bar */}
      <MobileTopBar
        streak={data.streak.currentStreak}
        unreadCount={2}
        onPressNotifications={() => router.push('/notifications')}
        onPressStreak={() => router.push('/progress')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.accent} />
        }
      >
        {/* Exam Countdown & Readiness Banner */}
        <View style={styles.countdownCard}>
          <View style={styles.countdownHeader}>
            <View>
              <Text style={styles.countdownTitle}>JAMB UTME 2026</Text>
              <Text style={styles.countdownSubtitle}>
                {data.daysToExam} days until your exam
              </Text>
            </View>
            <View style={styles.readinessBadge}>
              <Text style={styles.readinessNumber}>{data.examReadiness}%</Text>
              <Text style={styles.readinessLabel}>Readiness</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${data.examReadiness}%` },
              ]}
            />
          </View>

          <View style={styles.countdownFooter}>
            <Text style={styles.countdownFooterText}>
              On track for 300+ score goal
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/roadmap')}
              style={styles.viewRoadmapLink}
            >
              <Text style={styles.viewRoadmapText}>View Syllabus</Text>
              <Ionicons name="arrow-forward" size={12} color={Palette.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Hub */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => router.push('/quizzes')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Palette.accentTint }]}>
              <Ionicons name="checkbox-outline" size={18} color={Palette.accent} />
            </View>
            <Text style={styles.actionPillText}>Take Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => router.push('/assistant')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EDE7F6' }]}>
              <Ionicons name="sparkles" size={18} color="#6B4E8F" />
            </View>
            <Text style={styles.actionPillText}>Ask AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => router.push('/marathon')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Palette.warningTint }]}>
              <Ionicons name="flash" size={18} color={Palette.warning} />
            </View>
            <Text style={styles.actionPillText}>Marathon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => router.push('/mocks')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E0F2F1' }]}>
              <Ionicons name="document-text" size={18} color="#2F6B6B" />
            </View>
            <Text style={styles.actionPillText}>Mocks</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Focus Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTag}>TODAY’S FOCUS</Text>
              <Text style={styles.sectionTitle}>Daily Study Goals</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/planner')}
            >
              <Text style={styles.seeAllText}>Planner</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topicList}>
            {data.todayTopics.map((item, index) => {
              const subjectColor = getSubjectColor(item.subjectSlug);
              return (
                <TouchableOpacity
                  key={`${item.subjectSlug}-${index}`}
                  style={styles.topicItem}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: '/topic-detail',
                      params: {
                        subjectSlug: item.subjectSlug,
                        title: item.topicName,
                      },
                    })
                  }
                >
                  <View
                    style={[styles.subjectIndicator, { backgroundColor: subjectColor }]}
                  />
                  <View style={styles.topicContent}>
                    <View style={styles.topicTopRow}>
                      <Text style={[styles.subjectName, { color: subjectColor }]}>
                        {item.subjectName}
                      </Text>
                      <View style={styles.timeTag}>
                        <Ionicons name="time-outline" size={12} color={Palette.ink3} />
                        <Text style={styles.timeText}>{item.estimatedMinutes}m</Text>
                      </View>
                    </View>
                    <Text style={styles.topicTitle}>{item.topicName}</Text>
                  </View>
                  <View style={styles.startBadge}>
                    <Ionicons name="play" size={12} color={Palette.accent} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('/quizzes')}
          >
            <Text style={styles.primaryButtonText}>Start Daily Practice</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Streak & XP Gamification Row */}
        <View style={styles.statsGrid}>
          {/* Streak Card */}
          <View style={styles.statCard}>
            <View style={styles.statIconBadge}>
              <Ionicons name="flame" size={20} color={Palette.warning} />
            </View>
            <Text style={styles.statNumber}>{data.streak.currentStreak} Days</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statSublabel}>
              Longest: {data.streak.longestStreak} days
            </Text>
          </View>

          {/* XP Card */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: Palette.accentTint }]}>
              <Ionicons name="trophy" size={20} color={Palette.accent} />
            </View>
            <Text style={styles.statNumber}>{data.xp.totalXP} XP</Text>
            <Text style={styles.statLabel}>{data.xp.rankName}</Text>
            <Text style={styles.statSublabel}>
              {data.xp.xpToNextRank} XP to {data.xp.nextRankName}
            </Text>
          </View>
        </View>

        {/* Weak Topics (Needs Attention) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTag}>NEEDS REVISION</Text>
              <Text style={styles.sectionTitle}>Priority Focus Topics</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/roadmap')}>
              <Text style={styles.seeAllText}>Review All</Text>
            </TouchableOpacity>
          </View>

          {data.weakestTopics.map((topic, i) => (
            <TouchableOpacity
              key={i}
              style={styles.weakTopicRow}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/topic-detail',
                  params: {
                    subjectSlug: topic.subjectSlug,
                    title: topic.topicName,
                  },
                })
              }
            >
              <View style={styles.weakTopicInfo}>
                <Text style={styles.weakSubjectName}>{topic.subjectName}</Text>
                <Text style={styles.weakTopicTitle}>{topic.topicName}</Text>
              </View>
              <View style={styles.masteryPill}>
                <Text style={styles.masteryText}>{topic.mastery}%</Text>
              </View>
              <TouchableOpacity
                style={styles.drillButton}
                activeOpacity={0.7}
                onPress={() => router.push('/quizzes')}
              >
                <Text style={styles.drillButtonText}>Drill</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Study Trend / Scores */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTag}>PERFORMANCE</Text>
              <Text style={styles.sectionTitle}>This Week's Accuracy</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/progress')}>
              <Text style={styles.seeAllText}>Detailed</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartBarRow}>
            {data.recentScores.map((score, idx) => (
              <View key={idx} style={styles.chartCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${score.averageScore}%`,
                        backgroundColor:
                          score.averageScore >= 80
                            ? Palette.success
                            : score.averageScore >= 70
                            ? Palette.accent
                            : Palette.warning,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{score.date}</Text>
                <Text style={styles.barValue}>{score.averageScore}%</Text>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  countdownCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countdownTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: Palette.ink,
  },
  countdownSubtitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 13,
    color: Palette.ink3,
    marginTop: 2,
  },
  readinessBadge: {
    backgroundColor: Palette.accentTint,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  readinessNumber: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: Palette.accent,
  },
  readinessLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Palette.accent2,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 8,
    backgroundColor: Palette.paper2,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.accent,
    borderRadius: 4,
  },
  countdownFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  countdownFooterText: {
    fontSize: 12,
    color: Palette.ink2,
    fontWeight: '500',
  },
  viewRoadmapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewRoadmapText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.accent,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionPill: {
    flex: 1,
    backgroundColor: Palette.card,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 6,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.ink,
  },
  sectionCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: Palette.ink,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.accent,
  },
  topicList: {
    gap: 10,
    marginBottom: 14,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.paper,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 10,
  },
  subjectIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  topicContent: {
    flex: 1,
  },
  topicTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  subjectName: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    fontSize: 11,
    color: Palette.ink3,
    fontWeight: '500',
  },
  topicTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
  startBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Palette.accent,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.warningTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: Palette.ink,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.ink2,
    marginTop: 2,
  },
  statSublabel: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 4,
  },
  weakTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.paper2,
    gap: 8,
  },
  weakTopicInfo: {
    flex: 1,
  },
  weakSubjectName: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.danger,
    textTransform: 'uppercase',
  },
  weakTopicTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.ink,
    marginTop: 1,
  },
  masteryPill: {
    backgroundColor: Palette.dangerTint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  masteryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.danger,
  },
  drillButton: {
    backgroundColor: Palette.paper2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  drillButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.ink,
  },
  chartBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 70,
    width: 14,
    backgroundColor: Palette.paper2,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 10,
    color: Palette.ink3,
    marginTop: 6,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '700',
    color: Palette.ink2,
  },
});
