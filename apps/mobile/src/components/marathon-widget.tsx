import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import {
  useMarathonStore,
  useMarathonActive,
  elapsedSeconds,
} from '@/lib/marathon-store';

export function MarathonWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const active = useMarathonActive();
  const status = useMarathonStore((s) => s.status);
  const plannedDurationMin = useMarathonStore((s) => s.plannedDurationMin);
  const pomodoroLength = useMarathonStore((s) => s.pomodoroLength);
  const startedAt = useMarathonStore((s) => s.startedAt);
  const pausedMs = useMarathonStore((s) => s.pausedMs);
  const pausedAt = useMarathonStore((s) => s.pausedAt);
  const pause = useMarathonStore((s) => s.pause);
  const resume = useMarathonStore((s) => s.resume);

  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  // Don't show floating widget if user is currently inside the marathon screen
  if (!active || pathname === '/marathon') return null;

  const totalElapsed = elapsedSeconds({ startedAt, pausedMs, pausedAt });
  const pomodoroSeconds = pomodoroLength * 60;
  const currentPomodoroRemaining = Math.max(
    0,
    pomodoroSeconds - (totalElapsed % pomodoroSeconds)
  );

  const mins = Math.floor(currentPomodoroRemaining / 60);
  const secs = currentPomodoroRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;

  return (
    <View style={styles.floatingContainer}>
      <TouchableOpacity
        style={styles.pillCard}
        activeOpacity={0.85}
        onPress={() => router.push('/marathon')}
      >
        <View style={styles.timerBadge}>
          <Ionicons
            name={status === 'running' ? 'flash' : 'pause'}
            size={16}
            color={Palette.warning}
          />
          <Text style={styles.timerText}>{timeFormatted}</Text>
        </View>

        <Text style={styles.label}>Focus Session</Text>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={(e) => {
            e.stopPropagation();
            if (status === 'running') pause();
            else resume();
          }}
        >
          <Ionicons
            name={status === 'running' ? 'pause' : 'play'}
            size={14}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    zIndex: 99,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  controlBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
