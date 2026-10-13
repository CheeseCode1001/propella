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
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';

interface NotificationItem {
  id: string;
  type: 'streak' | 'revision' | 'mock' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'streak',
      title: '🔥 7-Day Study Streak Reached!',
      message: 'Great consistency! You earned +50 XP and unlocked the 7-Day Flame badge.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'revision',
      title: 'Spaced Repetition Due: Photoelectric Effect',
      message: 'Take a quick 5-question refresher quiz to retain maximum formula recall.',
      time: '5 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'mock',
      title: 'New JAMB Mock Simulation Available',
      message: 'JAMB 2026 CBT Simulation #4 is now live. Test your speed in under 45 minutes.',
      time: 'Yesterday',
      read: true,
    },
  ]);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: any[] }>('/notifications');
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setNotifications(res.data);
        }
      } catch {}
    }
    load();
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Mark read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.itemCard,
              !item.read && styles.itemCardUnread,
            ]}
            activeOpacity={0.7}
            onPress={() => {
              if (item.type === 'revision') router.push('/quizzes');
              if (item.type === 'mock') router.push('/mocks');
            }}
          >
            <View style={styles.itemHeader}>
              <View
                style={[
                  styles.iconWrap,
                  item.type === 'streak'
                    ? { backgroundColor: Palette.warningTint }
                    : item.type === 'revision'
                    ? { backgroundColor: Palette.accentTint }
                    : { backgroundColor: Palette.paper2 },
                ]}
              >
                <Ionicons
                  name={
                    item.type === 'streak'
                      ? 'flame'
                      : item.type === 'revision'
                      ? 'time'
                      : 'document-text'
                  }
                  size={18}
                  color={
                    item.type === 'streak'
                      ? Palette.warning
                      : item.type === 'revision'
                      ? Palette.accent
                      : Palette.ink
                  }
                />
              </View>
              <View style={styles.itemHeaderText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
              </View>
            </View>
            <Text style={styles.itemMessage}>{item.message}</Text>
          </TouchableOpacity>
        ))}
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
  headerTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 17,
    fontWeight: '700',
    color: Palette.ink,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.accent,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 8,
  },
  itemCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: Palette.accent,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemHeaderText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.ink,
  },
  itemTime: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 1,
  },
  itemMessage: {
    fontSize: 13,
    color: Palette.ink2,
    lineHeight: 18,
    paddingLeft: 44,
  },
});
