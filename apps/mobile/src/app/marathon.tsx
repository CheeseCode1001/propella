import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { mockQuizQuestions } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MarathonScreen() {
  const router = useRouter();
  const [qIndex, setQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Pool of marathon questions
  const pool = [
    ...mockQuizQuestions,
    ...mockQuizQuestions.map((q, i) => ({ ...q, id: `m-${i}-2` })),
  ];

  const currentQ = pool[qIndex % pool.length];

  function handleSelectOption(label: string) {
    if (gameOver) return;

    if (label === currentQ.correctOption) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 10 * Math.min(newCombo, 5);
      setScore((prev) => prev + points);
      setQIndex((prev) => prev + 1);
    } else {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setCombo(0);
      if (remainingLives <= 0) {
        setGameOver(true);
      } else {
        setQIndex((prev) => prev + 1);
      }
    }
  }

  function handleRestart() {
    setQIndex(0);
    setLives(3);
    setCombo(0);
    setScore(0);
    setGameOver(false);
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

        {/* Lives Counter */}
        <View style={styles.livesRow}>
          {[1, 2, 3].map((heartIndex) => (
            <Ionicons
              key={heartIndex}
              name={heartIndex <= lives ? 'heart' : 'heart-outline'}
              size={20}
              color={Palette.danger}
            />
          ))}
        </View>

        {/* Score & Combo */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>
      </View>

      {!gameOver ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Combo Indicator */}
          {combo > 1 && (
            <View style={styles.comboBanner}>
              <Ionicons name="flame" size={16} color={Palette.warning} />
              <Text style={styles.comboText}>COMBO x{combo} ACTIVE (+{10 * Math.min(combo, 5)} XP/q)</Text>
            </View>
          )}

          {/* Question Card */}
          <View style={styles.card}>
            <View style={styles.subjectTag}>
              <Text style={styles.subjectTagText}>{currentQ.subjectName}</Text>
              <Text style={styles.streakCount}>Run: {qIndex + 1}</Text>
            </View>
            <Text style={styles.qText}>{currentQ.question}</Text>
          </View>

          {/* Rapid Options */}
          <View style={styles.optionsWrap}>
            {currentQ.options.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={styles.optButton}
                activeOpacity={0.7}
                onPress={() => handleSelectOption(opt.label)}
              >
                <View style={styles.optBadge}>
                  <Text style={styles.optBadgeText}>{opt.label}</Text>
                </View>
                <Text style={styles.optText}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* Game Over Screen */
        <View style={styles.gameOverContainer}>
          <View style={styles.overBadge}>
            <Ionicons name="skull-outline" size={44} color={Palette.danger} />
          </View>
          <Text style={styles.overTitle}>Marathon Run Ended</Text>
          <Text style={styles.overScore}>{score} Points</Text>
          <Text style={styles.overSubtitle}>
            You cleared {qIndex} questions in this rapid endurance run!
          </Text>

          <View style={styles.overButtonGroup}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleRestart}>
              <Text style={styles.primaryBtnText}>Run Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/')}>
              <Text style={styles.outlineBtnText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  livesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  scoreBadge: {
    backgroundColor: Palette.accentTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.accent,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  comboBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.warningTint,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1DCB8',
  },
  comboText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.warning,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 10,
  },
  subjectTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.accent,
    textTransform: 'uppercase',
  },
  streakCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.ink3,
  },
  qText: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    lineHeight: 23,
    color: Palette.ink,
    fontWeight: '600',
  },
  optionsWrap: {
    gap: 10,
  },
  optButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 12,
  },
  optBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink,
  },
  optText: {
    flex: 1,
    fontSize: 14,
    color: Palette.ink,
  },
  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  overBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.dangerTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  overTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: Palette.ink,
  },
  overScore: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.danger,
    marginVertical: 8,
  },
  overSubtitle: {
    fontSize: 14,
    color: Palette.ink3,
    textAlign: 'center',
    marginBottom: 24,
  },
  overButtonGroup: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Palette.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  outlineBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Palette.rule2,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
});
