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
import { Palette, Fonts } from '@/constants/theme';
import { mockLeaderboard } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';

export default function LeaderboardScreen() {
  const router = useRouter();
  const [board, setBoard] = useState(mockLeaderboard);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: any[] }>('/leaderboard');
        if (res?.data && Array.isArray(res.data) && res.data.length >= 3) {
          setBoard(res.data);
        }
      } catch {}
    }
    load();
  }, []);

  const top3 = board.slice(0, 3);
  const remaining = board.slice(3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Palette.ink} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Weekly XP race • Resets in 3 days</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
          {/* Rank 2 */}
          <View style={[styles.podiumColumn, styles.podiumCol2]}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{top3[1].avatar}</Text>
              <View style={[styles.rankBadge, { backgroundColor: '#A0A0A0' }]}>
                <Text style={styles.rankBadgeText}>2</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name.split(' ')[0]}</Text>
            <Text style={styles.podiumXp}>{top3[1].xp} XP</Text>
            <View style={[styles.podiumPillar, { height: 70 }]} />
          </View>

          {/* Rank 1 */}
          <View style={[styles.podiumColumn, styles.podiumCol1]}>
            <View style={styles.avatarWrap}>
              <Ionicons name="trophy" size={22} color="#D4AF37" style={styles.crownIcon} />
              <Text style={styles.avatarText}>{top3[0].avatar}</Text>
              <View style={[styles.rankBadge, { backgroundColor: '#D4AF37' }]}>
                <Text style={styles.rankBadgeText}>1</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{top3[0].name.split(' ')[0]}</Text>
            <Text style={styles.podiumXp}>{top3[0].xp} XP</Text>
            <View style={[styles.podiumPillar, { height: 95, backgroundColor: Palette.accent }]} />
          </View>

          {/* Rank 3 */}
          <View style={[styles.podiumColumn, styles.podiumCol3]}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{top3[2].avatar}</Text>
              <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}>
                <Text style={styles.rankBadgeText}>3</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name.split(' ')[0]}</Text>
            <Text style={styles.podiumXp}>{top3[2].xp} XP</Text>
            <View style={[styles.podiumPillar, { height: 50 }]} />
          </View>
        </View>

        {/* Full Ranking List */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Top Scholars This Week</Text>
          <View style={styles.rowsList}>
            {remaining.map((user: (typeof mockLeaderboard)[0]) => (
              <View
                key={user.rank}
                style={[
                  styles.userRow,
                  user.isCurrentUser && styles.userRowCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.rankNumber,
                    user.isCurrentUser && styles.rankNumberCurrent,
                  ]}
                >
                  #{user.rank}
                </Text>

                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallText}>{user.avatar}</Text>
                </View>

                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.userName,
                      user.isCurrentUser && styles.userNameCurrent,
                    ]}
                  >
                    {user.name}
                  </Text>
                  {user.school && (
                    <Text style={styles.userSchool} numberOfLines={1}>
                      {user.school}
                    </Text>
                  )}
                </View>

                <View style={styles.userStats}>
                  <Text style={styles.xpAmount}>{user.xp} XP</Text>
                  <View style={styles.streakSmallRow}>
                    <Ionicons name="flame" size={12} color={Palette.warning} />
                    <Text style={styles.streakSmallText}>{user.streak}d</Text>
                  </View>
                </View>
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
    gap: 16,
    paddingBottom: 40,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 12,
  },
  podiumColumn: {
    alignItems: 'center',
    width: 86,
  },
  podiumCol1: {
    zIndex: 2,
  },
  podiumCol2: {},
  podiumCol3: {},
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 6,
  },
  crownIcon: {
    position: 'absolute',
    top: -18,
  },
  avatarText: {
    fontSize: 32,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.ink,
  },
  podiumXp: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.accent,
    marginBottom: 6,
  },
  podiumPillar: {
    width: '100%',
    backgroundColor: Palette.paper2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  tableTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
    marginBottom: 12,
  },
  rowsList: {
    gap: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Palette.paper,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 10,
  },
  userRowCurrent: {
    backgroundColor: Palette.accentTint,
    borderColor: Palette.accent,
    borderWidth: 1.5,
  },
  rankNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.ink3,
    width: 28,
  },
  rankNumberCurrent: {
    color: Palette.accent,
    fontWeight: '800',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.ink,
  },
  userNameCurrent: {
    fontWeight: '700',
    color: Palette.accent,
  },
  userSchool: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 1,
  },
  userStats: {
    alignItems: 'flex-end',
  },
  xpAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink,
  },
  streakSmallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  streakSmallText: {
    fontSize: 10,
    color: Palette.warning,
    fontWeight: '600',
  },
});
