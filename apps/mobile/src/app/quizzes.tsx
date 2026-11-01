import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts, getSubjectColor } from '@/constants/theme';
import { mockQuizQuestions } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';

type QuizMode = 'study' | 'exam';

function formatClock(sec: number): string {
  const safe = Math.max(0, sec);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function QuizzesScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode>('study');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Exam mode state
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [remainingSec, setRemainingSec] = useState<number>(mockQuizQuestions.length * 90);

  const question = mockQuizQuestions[currentIndex];
  const subjectColor = getSubjectColor(question?.subjectSlug ?? 'physics');

  // Exam mode countdown timer
  useEffect(() => {
    if (mode !== 'exam' || isCompleted) return;
    if (remainingSec <= 0) {
      handleFinishExam();
      return;
    }
    const timer = setInterval(() => {
      setRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, isCompleted, remainingSec]);

  function handleSwitchMode(nextMode: QuizMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsCompleted(false);
    setExamAnswers({});
    setFlagged({});
    setRemainingSec(mockQuizQuestions.length * 90);
  }

  function handleSelectOption(label: string) {
    if (mode === 'study') {
      if (isSubmitted) return;
      setSelectedOption(label);
    } else {
      if (!question) return;
      setExamAnswers((prev) => ({ ...prev, [question.id]: label }));
    }
  }

  function handleCheckAnswer() {
    if (!selectedOption || !question) return;
    setIsSubmitted(true);
    if (selectedOption === question.correctOption) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNextQuestion() {
    if (currentIndex + 1 < mockQuizQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsCompleted(true);
    }
  }

  function handleFinishExam() {
    let correct = 0;
    for (const q of mockQuizQuestions) {
      if (examAnswers[q.id] === q.correctOption) {
        correct += 1;
      }
    }
    setScore(correct);
    setIsCompleted(true);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsCompleted(false);
    setExamAnswers({});
    setFlagged({});
    setRemainingSec(mockQuizQuestions.length * 90);
  }

  const activeSelection =
    mode === 'study' ? selectedOption : question ? examAnswers[question.id] ?? null : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Quiz Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Palette.ink} />
        </TouchableOpacity>
        <View style={styles.topBarTitleWrap}>
          <Text style={styles.topBarSubject}>{question?.subjectName ?? 'Quiz'}</Text>
          <Text style={styles.topBarTopic}>{question?.topicName}</Text>
        </View>
        {mode === 'exam' && !isCompleted ? (
          <View
            style={[
              styles.timerBadge,
              remainingSec <= 60 && styles.timerBadgeCritical,
            ]}
          >
            <Ionicons
              name="timer-outline"
              size={14}
              color={remainingSec <= 60 ? '#FFFFFF' : '#D97706'}
            />
            <Text
              style={[
                styles.timerText,
                remainingSec <= 60 && { color: '#FFFFFF' },
              ]}
            >
              {formatClock(remainingSec)}
            </Text>
          </View>
        ) : (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {currentIndex + 1}/{mockQuizQuestions.length}
            </Text>
          </View>
        )}
      </View>

      {/* Study Mode vs Exam Mode Switcher */}
      <View style={styles.modeToggleBar}>
        <TouchableOpacity
          style={[
            styles.modeToggleButton,
            mode === 'study' && styles.modeToggleButtonActive,
          ]}
          onPress={() => handleSwitchMode('study')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="book-outline"
            size={15}
            color={mode === 'study' ? '#FFFFFF' : Palette.ink2}
          />
          <Text
            style={[
              styles.modeToggleText,
              mode === 'study' && styles.modeToggleTextActive,
            ]}
          >
            Study Mode (Instant)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeToggleButton,
            mode === 'exam' && styles.modeToggleButtonExamActive,
          ]}
          onPress={() => handleSwitchMode('exam')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="stopwatch-outline"
            size={15}
            color={mode === 'exam' ? '#FFFFFF' : Palette.ink2}
          />
          <Text
            style={[
              styles.modeToggleText,
              mode === 'exam' && styles.modeToggleTextActive,
            ]}
          >
            Exam Mode (Timed CBT)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentIndex + 1) / mockQuizQuestions.length) * 100}%`,
              backgroundColor: mode === 'exam' ? '#D97706' : subjectColor,
            },
          ]}
        />
      </View>

      {!isCompleted ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionTagRow}>
              <View
                style={[
                  styles.subjectPill,
                  { backgroundColor: `${subjectColor}15` },
                ]}
              >
                <Text style={[styles.subjectPillText, { color: subjectColor }]}>
                  {question.year ?? 'Past Question'}
                </Text>
              </View>
              {mode === 'exam' ? (
                <TouchableOpacity
                  style={styles.flagButton}
                  onPress={() =>
                    setFlagged((prev) => ({
                      ...prev,
                      [question.id]: !prev[question.id],
                    }))
                  }
                >
                  <Ionicons
                    name={flagged[question.id] ? 'flag' : 'flag-outline'}
                    size={14}
                    color={flagged[question.id] ? '#D97706' : Palette.ink3}
                  />
                  <Text
                    style={[
                      styles.flagText,
                      flagged[question.id] && { color: '#D97706', fontWeight: '700' },
                    ]}
                  >
                    {flagged[question.id] ? 'Flagged' : 'Flag'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.pointsText}>+10 XP</Text>
              )}
            </View>

            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {question.options.map((opt) => {
              const isSelected = activeSelection === opt.label;
              const isCorrect =
                mode === 'study' && isSubmitted && opt.label === question.correctOption;
              const isWrong =
                mode === 'study' &&
                isSubmitted &&
                isSelected &&
                opt.label !== question.correctOption;

              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    isCorrect && styles.optionCardCorrect,
                    isWrong && styles.optionCardWrong,
                  ]}
                  onPress={() => handleSelectOption(opt.label)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.optionLabelBadge,
                      isSelected && styles.optionLabelBadgeSelected,
                      isCorrect && styles.optionLabelBadgeCorrect,
                      isWrong && styles.optionLabelBadgeWrong,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabelText,
                        (isSelected || isCorrect || isWrong) && styles.optionLabelTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation Alert when submitted in Study Mode */}
          {mode === 'study' && isSubmitted && (
            <View
              style={[
                styles.explanationCard,
                selectedOption === question.correctOption
                  ? styles.explanationSuccess
                  : styles.explanationDanger,
              ]}
            >
              <View style={styles.explanationHeader}>
                <Ionicons
                  name={
                    selectedOption === question.correctOption
                      ? 'checkmark-circle'
                      : 'close-circle'
                  }
                  size={20}
                  color={
                    selectedOption === question.correctOption
                      ? Palette.success
                      : Palette.danger
                  }
                />
                <Text
                  style={[
                    styles.explanationTitle,
                    {
                      color:
                        selectedOption === question.correctOption
                          ? Palette.success
                          : Palette.danger,
                    },
                  ]}
                >
                  {selectedOption === question.correctOption
                    ? 'Correct Answer!'
                    : `Incorrect. Correct is Option ${question.correctOption}`}
                </Text>
              </View>
              <Text style={styles.explanationBody}>{question.explanation}</Text>
            </View>
          )}

          {/* Action Bar */}
          {mode === 'study' ? (
            <View style={styles.bottomBar}>
              {!isSubmitted ? (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !selectedOption && styles.submitButtonDisabled,
                  ]}
                  disabled={!selectedOption}
                  onPress={handleCheckAnswer}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Check Answer</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleNextQuestion}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {currentIndex + 1 < mockQuizQuestions.length
                      ? 'Next Question'
                      : 'View Results'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.examControls}>
              <View style={styles.examNavRow}>
                <TouchableOpacity
                  style={[
                    styles.outlineButton,
                    { flex: 1 },
                    currentIndex === 0 && styles.submitButtonDisabled,
                  ]}
                  disabled={currentIndex === 0}
                  onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                >
                  <Text style={styles.outlineButtonText}>Previous</Text>
                </TouchableOpacity>

                {currentIndex + 1 < mockQuizQuestions.length ? (
                  <TouchableOpacity
                    style={[styles.submitButton, { flex: 1 }]}
                    onPress={() =>
                      setCurrentIndex((i) => Math.min(mockQuizQuestions.length - 1, i + 1))
                    }
                  >
                    <Text style={styles.submitButtonText}>
                      {activeSelection ? 'Next' : 'Skip'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: '#D97706' }]}
                onPress={handleFinishExam}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  Submit Exam ({Object.keys(examAnswers).length}/{mockQuizQuestions.length} Answered)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        /* Results Screen */
        <View style={styles.resultsContainer}>
          <View style={styles.resultsBadge}>
            <Ionicons name="trophy" size={48} color={Palette.accent} />
          </View>
          <Text style={styles.resultsTitle}>
            {mode === 'exam' ? 'Exam Submitted!' : 'Quiz Completed!'}
          </Text>
          <Text style={styles.resultsScore}>
            {score} / {mockQuizQuestions.length} Correct
          </Text>
          <Text style={styles.resultsSubtitle}>
            You scored {Math.round((score / mockQuizQuestions.length) * 100)}% in{' '}
            {mode === 'exam' ? 'Exam Mode' : 'Study Mode'} and earned +{score * 10} XP!
          </Text>

          <View style={styles.resultsButtonGroup}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRestart}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Practice Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push('/')}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Return to Dashboard</Text>
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
  topBarTitleWrap: {
    alignItems: 'center',
  },
  topBarSubject: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.accent,
    textTransform: 'uppercase',
  },
  topBarTopic: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
  counterBadge: {
    backgroundColor: Palette.paper2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timerBadgeCritical: {
    backgroundColor: Palette.danger,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  modeToggleBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Palette.paper,
  },
  modeToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Palette.paper2,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  modeToggleButtonActive: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  modeToggleButtonExamActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  modeToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink2,
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 4,
    backgroundColor: Palette.paper2,
  },
  progressFill: {
    height: '100%',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 12,
  },
  questionTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Palette.paper2,
  },
  flagText: {
    fontSize: 11,
    color: Palette.ink3,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.accent,
  },
  questionText: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    lineHeight: 24,
    color: Palette.ink,
    fontWeight: '600',
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Palette.rule,
    gap: 12,
  },
  optionCardSelected: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentTint,
  },
  optionCardCorrect: {
    borderColor: Palette.success,
    backgroundColor: Palette.successTint,
  },
  optionCardWrong: {
    borderColor: Palette.danger,
    backgroundColor: Palette.dangerTint,
  },
  optionLabelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelBadgeSelected: {
    backgroundColor: Palette.accent,
  },
  optionLabelBadgeCorrect: {
    backgroundColor: Palette.success,
  },
  optionLabelBadgeWrong: {
    backgroundColor: Palette.danger,
  },
  optionLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink,
  },
  optionLabelTextActive: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: Palette.ink,
    lineHeight: 20,
  },
  explanationCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  explanationSuccess: {
    backgroundColor: Palette.successTint,
    borderColor: '#C6E3CE',
  },
  explanationDanger: {
    backgroundColor: Palette.dangerTint,
    borderColor: '#F9D1D1',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  explanationBody: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.ink2,
  },
  bottomBar: {
    marginTop: 8,
  },
  examControls: {
    marginTop: 8,
    gap: 10,
  },
  examNavRow: {
    flexDirection: 'row',
    gap: 10,
  },
  submitButton: {
    backgroundColor: Palette.accent,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultsBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: Palette.ink,
  },
  resultsScore: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.accent,
    marginVertical: 8,
  },
  resultsSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: Palette.ink3,
    lineHeight: 20,
    marginBottom: 24,
  },
  resultsButtonGroup: {
    width: '100%',
    gap: 10,
  },
  outlineButton: {
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Palette.rule2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
});
