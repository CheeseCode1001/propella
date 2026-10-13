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
import type { TodayTopic, WeakTopic, DailyScore } from '@propella/shared';
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

  // Formatted date matching web: 'Tuesday, October 13.'
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }) + '.';

  // 7-day streak history dots (today + last 6 days)
  const streakCount = data.streak.currentStreak || 0;
  const historyDots = Array.from({ length: 7 }, (_, i) => {
    const isToday = i === 6;
    const studied = (6 - i) < streakCount;
    return { isToday, studied };
  });

  const totalMinutesPlanned = data.todayTopics.reduce((acc, t) => acc + (t.estimatedMinutes || 15), 0);
  const firstReadyIndex = data.todayTopics.findIndex(
    (t) => t.status === 'ready' || t.status === 'in-progress'
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Web Mobile Top Bar */}
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.accent}
          />
        }
      >
        {/* Above-grid: Date & Countdown Header (matches web dashboard) */}
        <View style={styles.pageHeader}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.examCountdownHeadline}>
            {data.daysToExam != null
              ? `${data.daysToExam} days until ${data.examType?.toUpperCase() || 'JAMB UTME'}`
              : 'Prepare for Excellence'}
          </Text>
        </View>

        {/* Quick Study Action Strip */}
        <View style={styles.quickActionsStrip}>
          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => router.push('/quizzes')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Palette.accentTint }]}>
              <Ionicons name="checkbox-outline" size={17} color={Palette.accent} />
            </View>
            <Text style={styles.actionPillText}>Take Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => router.push('/assistant')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#EDE7F6' }]}>
              <Ionicons name="sparkles" size={17} color="#6B4E8F" />
            </View>
            <Text style={styles.actionPillText}>Ask AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => router.push('/marathon')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Palette.warningTint }]}>
              <Ionicons name="flash" size={17} color={Palette.warning} />
            </View>
            <Text style={styles.actionPillText}>Marathon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => router.push('/mocks')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E0F2F1' }]}>
              <Ionicons name="document-text" size={17} color="#2F6B6B" />
            </View>
            <Text style={styles.actionPillText}>Mocks</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Focus Card (matches web TodayFocusCard) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kicker}>TODAY</Text>
            <Text style={styles.cardTitle}>
              {data.todayTopics.length} topic{data.todayTopics.length !== 1 ? 's' : ''} scheduled · {totalMinutesPlanned} min planned
            </Text>
          </View>

          <View style={styles.topicRowsList}>
            {data.todayTopics.map((item, idx) => {
              const subjColor = getSubjectColor(item.subjectSlug);
              const isFirstReady = idx === (firstReadyIndex >= 0 ? firstReadyIndex : 0);

              let badgeBg = Palette.paper2;
              let badgeColor = Palette.ink2;
              let badgeLabel = 'Ready';

              if (item.status === 'in-progress') {
                badgeBg = Palette.accentTint;
                badgeColor = Palette.accent;
                badgeLabel = 'In Progress';
              } else if (item.status === 'completed') {
                badgeBg = Palette.successTint;
                badgeColor = Palette.success;
                badgeLabel = 'Completed';
              } else if (item.status === 'needs-revision') {
                badgeBg = Palette.warningTint;
                badgeColor = Palette.warning;
                badgeLabel = 'Needs Revision';
              }

              return (
                <View key={`${item.subjectSlug}-${idx}`} style={styles.topicRow}>
                  {/* 4px vertical subject stripe */}
                  <View style={[styles.subjectStripe, { backgroundColor: subjColor }]} />

                  {/* Topic name */}
                  <Text style={styles.topicNameText} numberOfLines={1}>
                    {item.topicName}
                  </Text>

                  {/* Status badge */}
                  <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
                      {badgeLabel}
                    </Text>
                  </View>

                  {/* Minutes */}
                  <Text style={styles.monoMinutesText}>
                    {item.estimatedMinutes} min
                  </Text>

                  {/* Direct Start Action Button */}
                  {isFirstReady && (
                    <TouchableOpacity
                      style={styles.startButton}
                      activeOpacity={0.8}
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
                      <Text style={styles.startButtonText}>Start</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Footer: View full planner link */}
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.plannerLink}
              activeOpacity={0.7}
              onPress={() => router.push('/planner')}
            >
              <Text style={styles.plannerLinkText}>View full planner</Text>
              <Ionicons name="arrow-forward" size={13} color={Palette.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak & XP Gamification Grid */}
        <View style={styles.twoColumnGrid}>
          {/* Streak Card (matches web StreakCard) */}
          <View style={[styles.card, styles.gridCard]}>
            <View style={styles.streakCenterContent}>
              <Text style={styles.streakLargeNumber}>{data.streak.currentStreak}</Text>
              <Text style={styles.streakSubtitle}>
                {data.streak.currentStreak === 1 ? 'day in a row' : 'days in a row'}
              </Text>

              {/* 7-day dot progress track */}
              <View style={styles.streakDotsRow}>
                {historyDots.map((dot, i) => (
                  <View
                    key={i}
                    style={[
                      styles.streakDot,
                      {
                        width: dot.isToday ? 8 : 6,
                        height: dot.isToday ? 8 : 6,
                        borderRadius: dot.isToday ? 4 : 3,
                        backgroundColor: dot.studied ? Palette.accent : 'transparent',
                        borderColor: dot.studied ? Palette.accent : Palette.ink3,
                        borderWidth: dot.studied ? 0 : 1.5,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.longestStreakRow}>
                <Ionicons name="flame" size={14} color={Palette.ink3} />
                <Text style={styles.longestStreakText}>
                  Longest: {data.streak.longestStreak} days
                </Text>
              </View>
            </View>
          </View>

          {/* XP & Rank Card (matches web XPRankCard) */}
          <View style={[styles.card, styles.gridCard]}>
            <Text style={styles.kicker}>RANK</Text>
            <Text style={styles.rankNameText}>{data.xp.rankName}</Text>

            <View style={styles.rankProgressTrack}>
              <View
                style={[
                  styles.rankProgressFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.max(
                        15,
                        ((data.xp.totalXP % 1000) / 1000) * 100
                      )
                    )}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.rankMonoSubtext}>
              {data.xp.xpToNextRank != null && data.xp.nextRankName
                ? `${data.xp.xpToNextRank} XP to ${data.xp.nextRankName}`
                : `${data.xp.totalXP.toLocaleString()} XP total`}
            </Text>
          </View>
        </View>

        {/* Exam Readiness Card (matches web ExamReadinessCard) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kicker}>READINESS</Text>
            <Text style={styles.cardTitle}>Exam readiness</Text>
          </View>

          <View style={styles.readinessNumberRow}>
            <Text style={styles.readinessHugeNumber}>{data.examReadiness}</Text>
            <Text style={styles.readinessPercentSign}>%</Text>
          </View>

          <View style={styles.readinessTrack}>
            <View
              style={[
                styles.readinessFill,
                {
                  width: `${data.examReadiness}%`,
                  backgroundColor:
                    data.examReadiness >= 70 ? Palette.success : Palette.accent,
                },
              ]}
            />
          </View>

          <Text style={styles.readinessFootnote}>
            Based on topic mastery, quiz scores, and revision progress
          </Text>

          <TouchableOpacity
            style={styles.mockButton}
            activeOpacity={0.85}
            onPress={() => router.push('/mocks')}
          >
            <Ionicons name="document-text-outline" size={15} color={Palette.ink} />
            <Text style={styles.mockButtonText}>Take a mock exam</Text>
          </TouchableOpacity>
        </View>

        {/* Weakest Topics (matches web WeakestTopicsCard) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kicker}>NEEDS ATTENTION</Text>
            <Text style={styles.cardTitle}>Weakest topics</Text>
            <Text style={styles.cardSubtitle}>Topics with the lowest mastery</Text>
          </View>

          <View style={styles.weakTopicsList}>
            {data.weakestTopics.map((topic, i) => {
              const subjColor = getSubjectColor(topic.subjectSlug);
              return (
                <View key={i} style={styles.weakTopicRow}>
                  <View style={[styles.subjectStripe, { backgroundColor: subjColor }]} />
                  <Text style={styles.weakTopicTitle} numberOfLines={1}>
                    {topic.topicName}
                  </Text>

                  {/* Inline 56px mastery track */}
                  <View style={styles.masteryBarTrack}>
                    <View
                      style={[
                        styles.masteryBarFill,
                        {
                          width: `${topic.mastery}%`,
                          backgroundColor:
                            topic.mastery < 50 ? Palette.danger : Palette.warning,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.masteryMonoText}>{topic.mastery}%</Text>

                  <TouchableOpacity
                    style={styles.drillButton}
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
                    <Text style={styles.drillButtonText}>Drill</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Performance Trend (matches web PerformanceTrendCard) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kicker}>PERFORMANCE</Text>
            <Text style={styles.cardTitle}>Last 7 days</Text>
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

          <View style={styles.trendFooter}>
            <Text style={styles.trendFooterText}>
              Average score this week:{' '}
              {Math.round(
                data.recentScores.reduce((a, s) => a + s.averageScore, 0) /
                  (data.recentScores.length || 1)
              )}
              %
            </Text>
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
    gap: 14,
    paddingBottom: 48,
  },
  pageHeader: {
    marginBottom: 4,
  },
  dateLabel: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 13,
    color: Palette.ink3,
    marginBottom: 4,
  },
  examCountdownHeadline: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 26,
    fontWeight: '700',
    color: Palette.ink,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  quickActionsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 11,
    fontWeight: '600',
    color: Palette.ink,
  },
  card: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 12,
  },
  kicker: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 10,
    letterSpacing: 0.8,
    color: Palette.ink3,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '600',
  },
  cardTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 15,
    fontWeight: '600',
    color: Palette.ink,
  },
  cardSubtitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  topicRowsList: {
    gap: 10,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Palette.paper2,
  },
  subjectStripe: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },
  topicNameText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 14,
    fontWeight: '500',
    color: Palette.ink,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 10,
    fontWeight: '700',
  },
  monoMinutesText: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 11,
    color: Palette.ink3,
  },
  startButton: {
    backgroundColor: Palette.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  startButtonText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.paper2,
  },
  plannerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plannerLinkText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 12,
    fontWeight: '600',
    color: Palette.accent,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
  },
  streakCenterContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  streakLargeNumber: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 52,
    fontWeight: '700',
    color: Palette.ink,
    lineHeight: 56,
  },
  streakSubtitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 12,
    color: Palette.ink2,
    marginTop: 2,
    marginBottom: 10,
  },
  streakDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  streakDot: {
    flexShrink: 0,
  },
  longestStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  longestStreakText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 11,
    color: Palette.ink3,
  },
  rankNameText: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
    marginBottom: 12,
  },
  rankProgressTrack: {
    height: 4,
    backgroundColor: Palette.paper2,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  rankProgressFill: {
    height: '100%',
    backgroundColor: Palette.accent,
    borderRadius: 2,
  },
  rankMonoSubtext: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 10,
    color: Palette.ink3,
    marginTop: 4,
  },
  readinessNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 8,
  },
  readinessHugeNumber: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 44,
    fontWeight: '700',
    color: Palette.ink,
    lineHeight: 48,
  },
  readinessPercentSign: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 22,
    color: Palette.ink2,
  },
  readinessTrack: {
    height: 4,
    backgroundColor: Palette.paper2,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  readinessFill: {
    height: '100%',
    borderRadius: 2,
  },
  readinessFootnote: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 11,
    color: Palette.ink3,
    marginBottom: 14,
  },
  mockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.paper2,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  mockButtonText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 13,
    fontWeight: '600',
    color: Palette.ink,
  },
  weakTopicsList: {
    gap: 8,
  },
  weakTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.paper2,
  },
  weakTopicTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 13,
    fontWeight: '500',
    color: Palette.ink,
    flex: 1,
  },
  masteryBarTrack: {
    width: 52,
    height: 4,
    backgroundColor: Palette.paper2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  masteryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  masteryMonoText: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 11,
    color: Palette.ink3,
    width: 32,
    textAlign: 'right',
  },
  drillButton: {
    backgroundColor: Palette.paper2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  drillButtonText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 11,
    fontWeight: '600',
    color: Palette.accent,
  },
  chartBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingTop: 10,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 64,
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
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 9,
    color: Palette.ink3,
    marginTop: 6,
  },
  barValue: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: Palette.ink2,
  },
  trendFooter: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Palette.paper2,
  },
  trendFooterText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 12,
    color: Palette.ink2,
  },
});

