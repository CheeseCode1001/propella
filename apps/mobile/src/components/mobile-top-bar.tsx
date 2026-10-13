import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';

interface MobileTopBarProps {
  streak?: number;
  unreadCount?: number;
  onPressStreak?: () => void;
  onPressNotifications?: () => void;
}

export function MobileTopBar({
  streak = 7,
  unreadCount = 2,
  onPressStreak,
  onPressNotifications,
}: MobileTopBarProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Brand Logo */}
      <TouchableOpacity
        style={styles.logoRow}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)')}
      >
        <View style={styles.logoBadge}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.brandTitle}>Propella</Text>
      </TouchableOpacity>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        {/* Streak: matches web Flame size 15 with aubergine accent color + 16px medium ink number */}
        <TouchableOpacity
          style={styles.streakRow}
          activeOpacity={0.7}
          onPress={onPressStreak ?? (() => router.push('/progress'))}
        >
          <Ionicons name="flame" size={17} color={Palette.accent} />
          <Text style={styles.streakCount}>{streak}</Text>
        </TouchableOpacity>

        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.bellButton}
          activeOpacity={0.7}
          onPress={onPressNotifications ?? (() => router.push('/notifications'))}
        >
          <Ionicons name="notifications-outline" size={20} color={Palette.ink} />
          {unreadCount > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: Palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  brandTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
    letterSpacing: -0.4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  streakCount: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 16,
    fontWeight: '600',
    color: Palette.ink,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Palette.danger,
    borderWidth: 1,
    borderColor: Palette.paper,
  },
});

