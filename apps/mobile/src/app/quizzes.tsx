import React, { useState } from 'react';
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
import { Palette, Fonts, getSubjectColor } from '@/constants/theme';
import { mockQuizQuestions, type QuizQuestion } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizzesScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const question = mockQuizQuestions[currentIndex];
  const subjectColor = getSubjectColor(question?.subjectSlug ?? 'physics');

  function handleSelectOption(label: string) {
    if (isSubmitted) return;
    setSelectedOption(label);
  }

  function handleCheckAnswer() {
    if (!selectedOption) return;
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

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  }

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
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{mockQuizQuestions.length}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentIndex + 1) / mockQuizQuestions.length) * 100}%`,
              backgroundColor: subjectColor,
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
              <Text style={styles.pointsText}>+10 XP</Text>
            </View>

            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.label;
              const isCorrect = isSubmitted && opt.label === question.correctOption;
              const isWrong =
                isSubmitted && isSelected && opt.label !== question.correctOption;

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

          {/* Explanation Alert when submitted */}
          {isSubmitted && (
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

          {/* Action Button */}
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
        </ScrollView>
      ) : (
        /* Results Screen */
        <View style={styles.resultsContainer}>
          <View style={styles.resultsBadge}>
            <Ionicons name="trophy" size={48} color={Palette.accent} />
          </View>
          <Text style={styles.resultsTitle}>Quiz Completed!</Text>
          <Text style={styles.resultsScore}>
            {score} / {mockQuizQuestions.length} Correct
          </Text>
          <Text style={styles.resultsSubtitle}>
            You scored {Math.round((score / mockQuizQuestions.length) * 100)}% and earned +
            {score * 10} XP towards your JAMB goal!
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
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
});
