import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { usePaywallStore } from '@/lib/paywall-store';
import { useRouter } from 'expo-router';
import { getApiUrl, setCustomApiUrl, testApiConnection } from '@/lib/api-client';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  const [selectedExam, setSelectedExam] = useState<'jamb' | 'waec' | 'neco'>('jamb');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(45);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Live API Connection state
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [apiStatus, setApiStatus] = useState<'testing' | 'online' | 'offline'>('testing');
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  const checkConnection = React.useCallback(async () => {
    setApiStatus('testing');
    const url = await getApiUrl();
    setCurrentApiUrl(url);
    const result = await testApiConnection();
    if (result.ok) {
      setApiStatus('online');
      setApiLatency(result.latencyMs);
    } else {
      setApiStatus('offline');
      setApiLatency(null);
    }
  }, []);

  React.useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const examOptions = [
    { label: 'JAMB UTME', key: 'jamb' as const },
    { label: 'WAEC SSCE', key: 'waec' as const },
    { label: 'NECO', key: 'neco' as const },
  ];

  const goalOptions = [30, 45, 60, 90];

  function handleLogout() {
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out of Propella?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <MobileTopBar />

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Student Profile & Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your study target, preferences and account
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>⚡</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || 'Alex O.'}</Text>
              <TouchableOpacity
                style={[
                  styles.planBadge,
                  user?.plan !== 'scholar' && !user?.entitlements?.isScholar && styles.planBadgeFree,
                ]}
                onPress={() => {
                  if (user?.plan !== 'scholar' && !user?.entitlements?.isScholar) {
                    openPaywall('scholar_monthly');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.planBadgeText}>
                  {user?.plan === 'scholar' || user?.entitlements?.isScholar ? 'Scholar' : 'Free • Upgrade'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userEmail}>{user?.email || 'alex.student@propellastudy.com'}</Text>
            <Text style={styles.userSchool}>Aiming for University of Lagos (UNILAG)</Text>
          </View>
        </View>

        {/* University Course Materials Vault */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.75}
          onPress={() => router.push('/files')}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="school-outline" size={20} color={Palette.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>University Course Materials</Text>
            <Text style={styles.actionDesc}>
              Browse 100L–500L past exam questions, lecture slides & departmental notes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Palette.ink3} />
        </TouchableOpacity>

        {/* Referral Balance Card */}
        <View style={styles.referralCard}>
          <View>
            <Text style={styles.referralLabel}>Referral Balance</Text>
            <Text style={styles.referralAmount}>
              {user?.referralBalance != null ? `₦${user.referralBalance.toLocaleString()}` : '₦2,500'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.referralButton}
            onPress={() =>
              Alert.alert(
                'Referral Program',
                'Share your referral code PROPELLA-ALEX to earn ₦500 airtime/credit per invited student who joins!'
              )
            }
          >
            <Text style={styles.referralButtonText}>Invite Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Target Exam Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Target Exam</Text>
          <Text style={styles.sectionDesc}>
            Adjust your primary syllabus and question bank focus
          </Text>
          <View style={styles.examOptionsRow}>
            {examOptions.map((opt) => {
              const isSelected = selectedExam === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.examPill,
                    isSelected && styles.examPillSelected,
                  ]}
                  onPress={() => setSelectedExam(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.examPillText,
                      isSelected && styles.examPillTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Daily Study Goal */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Daily Target Minutes</Text>
          <Text style={styles.sectionDesc}>
            Recommended for JAMB high score: 45–60 mins/day
          </Text>
          <View style={styles.goalRow}>
            {goalOptions.map((mins) => {
              const isSelected = dailyGoalMinutes === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.goalPill,
                    isSelected && styles.goalPillSelected,
                  ]}
                  onPress={() => setDailyGoalMinutes(mins)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.goalPillText,
                      isSelected && styles.goalPillTextSelected,
                    ]}
                  >
                    {mins}m
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferences Toggles */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingToggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Study Reminders</Text>
              <Text style={styles.toggleDesc}>
                Daily morning notifications for your syllabus targets
              </Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: Palette.paper2, true: Palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingToggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Sound Effects & Haptics</Text>
              <Text style={styles.toggleDesc}>
                Audio and haptic cues during quizzes and marathon
              </Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ false: Palette.paper2, true: Palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingToggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Paper Dark Theme</Text>
              <Text style={styles.toggleDesc}>
                Soft dark paper mode for late night study sessions
              </Text>
            </View>
            <Switch
              value={isDarkTheme}
              onValueChange={setIsDarkTheme}
              trackColor={{ false: Palette.paper2, true: Palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* API Server & Cloud Connectivity */}
        <View style={styles.sectionCard}>
          <View style={styles.syncRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.sectionTitle}>Backend API Server</Text>
                <View
                  style={[
                    styles.statusPill,
                    apiStatus === 'online'
                      ? styles.statusPillOnline
                      : apiStatus === 'testing'
                      ? styles.statusPillTesting
                      : styles.statusPillOffline,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          apiStatus === 'online'
                            ? Palette.success
                            : apiStatus === 'testing'
                            ? Palette.accent
                            : Palette.danger,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          apiStatus === 'online'
                            ? Palette.success
                            : apiStatus === 'testing'
                            ? Palette.accent
                            : Palette.danger,
                      },
                    ]}
                  >
                    {apiStatus === 'online'
                      ? `Online (${apiLatency}ms)`
                      : apiStatus === 'testing'
                      ? 'Pinging…'
                      : 'Offline'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionDesc} numberOfLines={1}>
                {currentApiUrl || 'Resolving endpoint...'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.pingButton}
              activeOpacity={0.7}
              onPress={checkConnection}
            >
              <Ionicons name="refresh-outline" size={15} color={Palette.accent} />
              <Text style={styles.pingButtonText}>Test</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.serverActionsRow}>
            <TouchableOpacity
              style={styles.serverPresetPill}
              activeOpacity={0.7}
              onPress={async () => {
                await setCustomApiUrl(null);
                await checkConnection();
                Alert.alert('Server Reset', 'Switched to Auto Detect (Metro Host/Localhost)');
              }}
            >
              <Text style={styles.serverPresetText}>Auto Detect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serverPresetPill}
              activeOpacity={0.7}
              onPress={async () => {
                await setCustomApiUrl('http://10.0.2.2:5000');
                await checkConnection();
                Alert.alert('Server Changed', 'Switched to Android Emulator (10.0.2.2:5000)');
              }}
            >
              <Text style={styles.serverPresetText}>Emulator (10.0.2.2)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serverPresetPill}
              activeOpacity={0.7}
              onPress={async () => {
                await setCustomApiUrl('https://propella-uo1q.onrender.com');
                await checkConnection();
                Alert.alert('Server Changed', 'Switched to Render Cloud API');
              }}
            >
              <Text style={styles.serverPresetText}>Render Cloud</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline Cache & Sync */}
        <View style={styles.sectionCard}>
          <View style={styles.syncRow}>
            <View>
              <Text style={styles.sectionTitle}>Offline Question Bank</Text>
              <Text style={styles.sectionDesc}>1,250 questions cached locally</Text>
            </View>
            <TouchableOpacity
              style={styles.syncButton}
              onPress={() => Alert.alert('Offline Sync', 'All past questions and syllabus notes are up-to-date for offline practice!')}
            >
              <Ionicons name="cloud-done-outline" size={16} color={Palette.success} />
              <Text style={styles.syncButtonText}>Synced</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={Palette.danger} />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 8,
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
  profileCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: Palette.ink,
  },
  planBadge: {
    backgroundColor: Palette.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeFree: {
    backgroundColor: Palette.warning,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  userSchool: {
    fontSize: 11,
    color: Palette.ink2,
    marginTop: 4,
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
  },
  actionDesc: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 2,
  },
  referralCard: {
    backgroundColor: Palette.paper2,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  referralLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.ink3,
    textTransform: 'uppercase',
  },
  referralAmount: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.success,
    marginTop: 2,
  },
  referralButton: {
    backgroundColor: Palette.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  referralButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: Palette.ink,
  },
  sectionDesc: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
    marginBottom: 12,
  },
  examOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  examPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Palette.paper,
    borderWidth: 1,
    borderColor: Palette.rule,
    alignItems: 'center',
  },
  examPillSelected: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  examPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.ink2,
  },
  examPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  goalRow: {
    flexDirection: 'row',
    gap: 10,
  },
  goalPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Palette.paper,
    borderWidth: 1,
    borderColor: Palette.rule,
    alignItems: 'center',
  },
  goalPillSelected: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  goalPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.ink2,
  },
  goalPillTextSelected: {
    color: '#FFFFFF',
  },
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
  toggleDesc: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.paper2,
    marginVertical: 10,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.successTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.success,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.dangerTint,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F9D1D1',
  },
  logoutButtonText: {
    color: Palette.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillOnline: {
    backgroundColor: Palette.successTint,
  },
  statusPillTesting: {
    backgroundColor: Palette.accentTint,
  },
  statusPillOffline: {
    backgroundColor: Palette.dangerTint,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  pingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.paper2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  pingButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.accent,
  },
  serverActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.paper2,
  },
  serverPresetPill: {
    flex: 1,
    backgroundColor: Palette.paper,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverPresetText: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 10.5,
    fontWeight: '600',
    color: Palette.ink2,
  },
});

