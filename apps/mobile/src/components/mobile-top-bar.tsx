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
        onPress={() => router.push('/')}
      >
        <View style={styles.logoBadge}>
          <Ionicons name="sparkles" size={15} color="#FFFFFF" />
        </View>
        <Text style={styles.brandTitle}>Propella</Text>
      </TouchableOpacity>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        {/* Streak Pill */}
        <TouchableOpacity
          style={styles.streakPill}
          activeOpacity={0.7}
          onPress={onPressStreak ?? (() => router.push('/progress'))}
        >
          <Ionicons name="flame" size={16} color={Palette.warning} />
          <Text style={styles.streakCount}>{streak}</Text>
        </TouchableOpacity>

        {/* Notifications Button */}
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onPressNotifications ?? (() => router.push('/notifications'))}
        >
          <Ionicons name="notifications-outline" size={20} color={Palette.ink} />
          {unreadCount > 0 && (
            <View style={styles.unreadDot}>
              <Text style={styles.unreadCountText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    backgroundColor: Palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
    letterSpacing: -0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.warningTint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1DCB8',
  },
  streakCount: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 13,
    fontWeight: '700',
    color: Palette.warning,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Palette.danger,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
