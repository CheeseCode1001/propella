import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { mockQuizQuestions } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedMobileMockState {
  currentQIndex: number;
  answers: Record<number, string>;
  flagged: Record<number, boolean>;
  timeLeftSeconds: number;
  hasInProgress: boolean;
}

// Persistent session state across screen mounts so leaving halfway never loses progress
let persistedMockSession: SavedMobileMockState = {
  currentQIndex: 0,
  answers: {},
  flagged: {},
  timeLeftSeconds: 45 * 60,
  hasInProgress: false,
};

export default function MocksScreen() {
  const router = useRouter();
  const [examStarted, setExamStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(persistedMockSession.currentQIndex);
  const [answers, setAnswers] = useState<Record<number, string>>(persistedMockSession.answers);
  const [flagged, setFlagged] = useState<Record<number, boolean>>(persistedMockSession.flagged);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(persistedMockSession.timeLeftSeconds);
  const [isFinished, setIsFinished] = useState(false);

  // Mock exam questions duplicated to create 20 questions
  const questions = [
    ...mockQuizQuestions,
    ...mockQuizQuestions.map((q, idx) => ({ ...q, id: `mock-${idx}-b` })),
    ...mockQuizQuestions.map((q, idx) => ({ ...q, id: `mock-${idx}-c` })),
    ...mockQuizQuestions.map((q, idx) => ({ ...q, id: `mock-${idx}-d` })),
  ];

  // Keep persistedMockSession updated whenever answers, question index, or timer changes
  useEffect(() => {
    if (examStarted && !isFinished) {
      persistedMockSession = {
        currentQIndex,
        answers,
        flagged,
        timeLeftSeconds,
        hasInProgress: true,
      };
    }
  }, [examStarted, isFinished, currentQIndex, answers, flagged, timeLeftSeconds]);

  useEffect(() => {
    if (!examStarted || isFinished || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          persistedMockSession.hasInProgress = false;
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, isFinished, isPaused]);

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

  function handlePauseAndExit() {
    persistedMockSession = {
      currentQIndex,
      answers,
      flagged,
      timeLeftSeconds,
      hasInProgress: true,
    };
    setIsPaused(false);
    setExamStarted(false);
    router.back();
  }

  function handleStartFresh() {
    persistedMockSession = {
      currentQIndex: 0,
      answers: {},
      flagged: {},
      timeLeftSeconds: 45 * 60,
      hasInProgress: true,
    };
    setCurrentQIndex(0);
    setAnswers({});
    setFlagged({});
    setTimeLeftSeconds(45 * 60);
    setIsPaused(false);
    setIsFinished(false);
    setExamStarted(true);
  }

  function handleResumeSaved() {
    setCurrentQIndex(persistedMockSession.currentQIndex);
    setAnswers(persistedMockSession.answers);
    setFlagged(persistedMockSession.flagged);
    setTimeLeftSeconds(persistedMockSession.timeLeftSeconds);
    setIsPaused(false);
    setIsFinished(false);
    setExamStarted(true);
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
          onPress: () => {
            persistedMockSession.hasInProgress = false;
            setIsFinished(true);
          },
        },
      ],
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
              setIsPaused(true);
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
              <Text style={styles.timerText}>
                {formatTimer(timeLeftSeconds)} {isPaused ? '(PAUSED)' : ''}
              </Text>
            </View>
          )}
        </View>

        {examStarted && !isFinished ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.pauseHeaderBtn}
              onPress={() => setIsPaused(true)}
            >
              <Ionicons name="pause" size={14} color={Palette.ink} />
              <Text style={styles.pauseHeaderBtnText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitHeaderBtn}
              onPress={handleSubmitExam}
            >
              <Text style={styles.submitHeaderBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
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
            Experience standard JAMB CBT conditions with accurate pacing, countdown clock, and pause & resume support so you never lose progress.
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
              <Ionicons name="pause-circle-outline" size={18} color={Palette.accent} />
              <Text style={styles.ruleText}>Pause anytime & resume right where you stopped</Text>
            </View>
          </View>

          {persistedMockSession.hasInProgress ? (
            <View style={{ width: '100%', gap: 10 }}>
              <View style={styles.savedBanner}>
                <Text style={styles.savedBannerTitle}>Paused Mock Exam Found</Text>
                <Text style={styles.savedBannerSub}>
                  Question {persistedMockSession.currentQIndex + 1} of {questions.length} •{' '}
                  {Object.keys(persistedMockSession.answers).length} Answered •{' '}
                  {formatTimer(persistedMockSession.timeLeftSeconds)} remaining
                </Text>
              </View>
              <TouchableOpacity
                style={styles.startExamButton}
                onPress={handleResumeSaved}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.startExamButtonText}>Continue Where You Stopped</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryExamButton}
                onPress={handleStartFresh}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryExamButtonText}>Start Over Fresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.startExamButton}
              onPress={handleStartFresh}
              activeOpacity={0.85}
            >
              <Text style={styles.startExamButtonText}>Begin Simulation</Text>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
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
              <Text style={styles.qNumber}>
                Question {currentQIndex + 1} of {questions.length}
              </Text>
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

          {/* Pause Overlay Modal */}
          <Modal visible={isPaused} transparent animationType="fade">
            <View style={styles.pauseModalBackdrop}>
              <View style={styles.pauseModalCard}>
                <View style={styles.pauseIconWrap}>
                  <Ionicons name="pause-circle" size={40} color={Palette.warning} />
                </View>
                <Text style={styles.pauseModalTitle}>Mock Exam Paused</Text>
                <Text style={styles.pauseModalDesc}>
                  Your timer is paused at {formatTimer(timeLeftSeconds)} and your progress (
                  {Object.keys(answers).length}/{questions.length} answered, Question{' '}
                  {currentQIndex + 1}) is saved.
                </Text>
                <TouchableOpacity
                  style={styles.startExamButton}
                  onPress={() => setIsPaused(false)}
                >
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                  <Text style={styles.startExamButtonText}>Resume Exam</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryExamButton, { marginTop: 8, width: '100%' }]}
                  onPress={handlePauseAndExit}
                >
                  <Text style={styles.secondaryExamButtonText}>Save & Continue Later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
              {correctCount >= 16
                ? 'Excellent! 320+ Projected Score'
                : correctCount >= 12
                ? 'Good! 260+ Projected Score'
                : 'Needs Practice (Focus on weak topics)'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startExamButton}
            onPress={() => {
              persistedMockSession.hasInProgress = false;
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
    fontSize: 15,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pauseHeaderBtn: {
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
  pauseHeaderBtnText: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '600',
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
  savedBanner: {
    backgroundColor: Palette.warningTint,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.warning,
  },
  savedBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.ink,
    marginBottom: 2,
  },
  savedBannerSub: {
    fontSize: 12,
    color: Palette.ink2,
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
  secondaryExamButton: {
    backgroundColor: Palette.card,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Palette.rule2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryExamButtonText: {
    color: Palette.ink,
    fontSize: 14,
    fontWeight: '600',
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
  pauseModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pauseModalCard: {
    width: '100%',
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  pauseIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.warningTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pauseModalTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
    marginBottom: 8,
  },
  pauseModalDesc: {
    fontSize: 13,
    color: Palette.ink2,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
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
