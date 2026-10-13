import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { mockQuizQuestions } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MocksScreen() {
  const router = useRouter();
  const [examStarted, setExamStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60); // 45 minutes
  const [isFinished, setIsFinished] = useState(false);

  // Mock exam questions duplicated to create 20 questions
  const questions = [
    ...mockQuizQuestions,
    ...mockQuizQuestions.map((q, idx) => ({ ...q, id: `mock-${idx}-b` })),
    ...mockQuizQuestions.map((q, idx) => ({ ...q, id: `mock-${idx}-c` })),
    ...mockQuizQuestions.map((q, idx) => ({ ...q, id: `mock-${idx}-d` })),
  ];

  useEffect(() => {
    if (!examStarted || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, isFinished]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  function handleSelectOption(label: string) {
    setAnswers((prev) => ({ ...prev, [currentQIndex]: label }));
  }

  function toggleFlag() {
    setFlagged((prev) => ({ ...prev, [currentQIndex]: !prev[currentQIndex] }));
  }

  function handleSubmitExam() {
    Alert.alert(
      'Submit Mock Exam',
      `You have answered ${Object.keys(answers).length} out of ${questions.length} questions. Submit now?`,
      [
        { text: 'Continue Exam', style: 'cancel' },
        {
          text: 'Submit Exam',
          style: 'default',
          onPress: () => setIsFinished(true),
        },
      ]
    );
  }

  const currentQ = questions[currentQIndex];

  // Calculate score
  const correctCount = Object.entries(answers).reduce((acc, [index, choice]) => {
    const q = questions[Number(index)];
    return q && q.correctOption === choice ? acc + 1 : acc;
  }, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (examStarted && !isFinished) {
              Alert.alert('Leave Exam?', 'Your current mock progress will be lost.', [
                { text: 'Stay', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => router.back() },
              ]);
            } else {
              router.back();
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Palette.ink} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.examTitle}>JAMB UTME Simulation</Text>
          {examStarted && !isFinished && (
            <View style={styles.timerBadge}>
              <Ionicons name="time" size={14} color={Palette.warning} />
              <Text style={styles.timerText}>{formatTimer(timeLeftSeconds)}</Text>
            </View>
          )}
        </View>

        {examStarted && !isFinished ? (
          <TouchableOpacity
            style={styles.submitHeaderBtn}
            onPress={handleSubmitExam}
          >
            <Text style={styles.submitHeaderBtnText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {!examStarted ? (
        /* Exam Pre-flight Screen */
        <ScrollView style={styles.scroll} contentContainerStyle={styles.introContainer}>
          <View style={styles.introBadge}>
            <Ionicons name="document-text" size={36} color={Palette.accent} />
          </View>
          <Text style={styles.introTitle}>Full JAMB Mock Simulator</Text>
          <Text style={styles.introDesc}>
            Experience standard JAMB CBT conditions with accurate pacing, countdown clock, and multi-question review palette.
          </Text>

          <View style={styles.rulesCard}>
            <View style={styles.ruleRow}>
              <Ionicons name="help-circle-outline" size={18} color={Palette.accent} />
              <Text style={styles.ruleText}>{questions.length} Questions (4 Core Subjects)</Text>
            </View>
            <View style={styles.ruleRow}>
              <Ionicons name="timer-outline" size={18} color={Palette.accent} />
              <Text style={styles.ruleText}>45 Minutes Duration</Text>
            </View>
            <View style={styles.ruleRow}>
              <Ionicons name="flag-outline" size={18} color={Palette.accent} />
              <Text style={styles.ruleText}>Flag questions to return later</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startExamButton}
            onPress={() => setExamStarted(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.startExamButtonText}>Begin Simulation</Text>
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      ) : !isFinished ? (
        /* Live Exam Screen */
        <View style={styles.liveContainer}>
          {/* Question Palette Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paletteScroll}
          >
            {questions.map((_, idx) => {
              const isCurrent = currentQIndex === idx;
              const isAnswered = answers[idx] !== undefined;
              const isFlag = flagged[idx];

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.palettePill,
                    isCurrent && styles.palettePillCurrent,
                    isAnswered && !isCurrent && styles.palettePillAnswered,
                    isFlag && styles.palettePillFlagged,
                  ]}
                  onPress={() => setCurrentQIndex(idx)}
                >
                  <Text
                    style={[
                      styles.palettePillText,
                      (isCurrent || isAnswered) && styles.palettePillTextActive,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Active Question Box */}
          <ScrollView style={styles.scroll} contentContainerStyle={styles.qContent}>
            <View style={styles.qHeaderRow}>
              <Text style={styles.qNumber}>Question {currentQIndex + 1} of {questions.length}</Text>
              <TouchableOpacity style={styles.flagButton} onPress={toggleFlag}>
                <Ionicons
                  name={flagged[currentQIndex] ? 'flag' : 'flag-outline'}
                  size={16}
                  color={flagged[currentQIndex] ? Palette.danger : Palette.ink3}
                />
                <Text style={styles.flagText}>
                  {flagged[currentQIndex] ? 'Flagged' : 'Flag'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.qStemCard}>
              <Text style={styles.qStemText}>{currentQ.question}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsWrap}>
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQIndex] === opt.label;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.optCard,
                      isSelected && styles.optCardSelected,
                    ]}
                    onPress={() => handleSelectOption(opt.label)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.optBadge,
                        isSelected && styles.optBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optBadgeText,
                          isSelected && styles.optBadgeTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    <Text style={styles.optText}>{opt.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Prev / Next Navigation Bar */}
            <View style={styles.navBottomBar}>
              <TouchableOpacity
                style={[
                  styles.navStepBtn,
                  currentQIndex === 0 && styles.navStepBtnDisabled,
                ]}
                disabled={currentQIndex === 0}
                onPress={() => setCurrentQIndex((prev) => prev - 1)}
              >
                <Ionicons name="arrow-back" size={16} color={Palette.ink} />
                <Text style={styles.navStepText}>Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navStepBtn}
                onPress={() => {
                  if (currentQIndex + 1 < questions.length) {
                    setCurrentQIndex((prev) => prev + 1);
                  } else {
                    handleSubmitExam();
                  }
                }}
              >
                <Text style={styles.navStepText}>
                  {currentQIndex + 1 < questions.length ? 'Next' : 'Review'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={Palette.ink} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      ) : (
        /* Exam Report Screen */
        <ScrollView style={styles.scroll} contentContainerStyle={styles.reportContainer}>
          <View style={styles.reportBadge}>
            <Ionicons name="ribbon" size={40} color={Palette.accent} />
          </View>
          <Text style={styles.reportTitle}>Mock Exam Complete</Text>
          <Text style={styles.reportScore}>
            Score: {Math.round((correctCount / questions.length) * 400)} / 400
          </Text>
          <Text style={styles.reportSubtitle}>
            Correct: {correctCount} • Attempted: {Object.keys(answers).length}/{questions.length}
          </Text>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Estimated JAMB Score Projection</Text>
            <Text style={styles.projectionText}>
              {correctCount >= 16 ? 'Excellent! 320+ Projected Score' : correctCount >= 12 ? 'Good! 260+ Projected Score' : 'Needs Practice (Focus on weak topics)'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startExamButton}
            onPress={() => {
              setExamStarted(false);
              setIsFinished(false);
              setAnswers({});
              setFlagged({});
              setTimeLeftSeconds(45 * 60);
              setCurrentQIndex(0);
            }}
          >
            <Text style={styles.startExamButtonText}>Try Another Mock</Text>
          </TouchableOpacity>
        </ScrollView>
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
    backgroundColor: Palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
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
  topBarCenter: {
    alignItems: 'center',
  },
  examTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: Palette.ink,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.warningTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.warning,
    fontFamily: Fonts?.mono ?? 'monospace',
  },
  submitHeaderBtn: {
    backgroundColor: Palette.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  submitHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  introContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  introBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  introTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: Palette.ink,
    textAlign: 'center',
  },
  introDesc: {
    fontSize: 14,
    color: Palette.ink3,
    textAlign: 'center',
    lineHeight: 20,
  },
  rulesCard: {
    width: '100%',
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    padding: 16,
    gap: 12,
    marginVertical: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleText: {
    fontSize: 13,
    color: Palette.ink,
    fontWeight: '500',
  },
  startExamButton: {
    backgroundColor: Palette.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  startExamButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  liveContainer: {
    flex: 1,
  },
  paletteScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
  },
  palettePill: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palettePillCurrent: {
    borderColor: Palette.accent,
    borderWidth: 2,
    backgroundColor: Palette.accentTint,
  },
  palettePillAnswered: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  palettePillFlagged: {
    borderColor: Palette.danger,
    borderWidth: 1.5,
  },
  palettePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink,
  },
  palettePillTextActive: {
    color: '#FFFFFF',
  },
  qContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  qHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.ink2,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.paper2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.ink2,
  },
  qStemCard: {
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  qStemText: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    lineHeight: 23,
    color: Palette.ink,
  },
  optionsWrap: {
    gap: 10,
  },
  optCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Palette.rule,
    gap: 12,
  },
  optCardSelected: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentTint,
  },
  optBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optBadgeSelected: {
    backgroundColor: Palette.accent,
  },
  optBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink,
  },
  optBadgeTextSelected: {
    color: '#FFFFFF',
  },
  optText: {
    flex: 1,
    fontSize: 14,
    color: Palette.ink,
  },
  navBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  navStepBtnDisabled: {
    opacity: 0.4,
  },
  navStepText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.ink,
  },
  reportContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  reportBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  reportTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: Palette.ink,
  },
  reportScore: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.accent,
  },
  reportSubtitle: {
    fontSize: 14,
    color: Palette.ink3,
  },
  breakdownCard: {
    width: '100%',
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    alignItems: 'center',
    marginVertical: 12,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.ink2,
    marginBottom: 6,
  },
  projectionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.success,
  },
});
