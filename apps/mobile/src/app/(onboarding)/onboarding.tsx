import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isLoading, setIsLoading] = useState(false);

  // Wizard state
  const [examType, setExamType] = useState<'jamb' | 'waec' | 'neco'>('jamb');
  const [course, setCourse] = useState('Medicine & Surgery');
  const [university, setUniversity] = useState('University of Lagos (UNILAG)');
  const [learningStyle, setLearningStyle] = useState<'practice' | 'visual' | 'reading' | 'mixed'>('practice');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'english',
    'mathematics',
    'physics',
    'chemistry',
  ]);
  const [dailyMinutes, setDailyMinutes] = useState(60);

  const availableSubjects = [
    { slug: 'english', name: 'Use of English' },
    { slug: 'mathematics', name: 'Mathematics' },
    { slug: 'physics', name: 'Physics' },
    { slug: 'chemistry', name: 'Chemistry' },
    { slug: 'biology', name: 'Biology' },
    { slug: 'economics', name: 'Economics' },
    { slug: 'government', name: 'Government' },
    { slug: 'literature', name: 'Literature in English' },
  ];

  function toggleSubject(slug: string) {
    if (selectedSubjects.includes(slug)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== slug));
      }
    } else {
      if (selectedSubjects.length < 4) {
        setSelectedSubjects([...selectedSubjects, slug]);
      }
    }
  }

  async function handleFinish() {
    setIsLoading(true);
    try {
      await api.post('/onboarding', {
        examType,
        intendedCourse: course,
        schoolName: university,
        learningStyle,
        subjectSlugs: selectedSubjects,
        dailyStudyMinutes: dailyMinutes,
      }).catch(() => null);

      if (user) {
        setUser({
          ...user,
          onboardingCompleted: true,
          onboardingStep: 6,
        });
      }
      router.replace('/(tabs)');
    } catch {
      if (user) {
        setUser({ ...user, onboardingCompleted: true });
      }
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={20} color={Palette.ink} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step / totalSteps) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.stepCounter}>{step}/{totalSteps}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Target Exam */}
        {step === 1 && (
          <View style={styles.stepBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="school-outline" size={28} color={Palette.accent} />
            </View>
            <Text style={styles.stepTitle}>What exam are you preparing for?</Text>
            <Text style={styles.stepDesc}>
              We personalize your questions and syllabus according to the latest official guidelines.
            </Text>

            <View style={styles.optionsList}>
              {[
                { key: 'jamb', title: 'JAMB UTME 2026', desc: 'Computer Based Test (CBT) simulator & past questions' },
                { key: 'waec', title: 'WAEC WASSCE', desc: 'Theory walkthroughs and objective drills' },
                { key: 'neco', title: 'NECO SSCE', desc: 'National senior certificate exam syllabus' },
              ].map((item) => {
                const isSelected = examType === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                    onPress={() => setExamType(item.key as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardOptionTextWrap}>
                      <Text style={styles.cardOptionTitle}>{item.title}</Text>
                      <Text style={styles.cardOptionDesc}>{item.desc}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isSelected ? Palette.accent : Palette.ink3}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 2: Course & Institution */}
        {step === 2 && (
          <View style={styles.stepBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="trophy-outline" size={28} color={Palette.accent} />
            </View>
            <Text style={styles.stepTitle}>Your Target Dream Course</Text>
            <Text style={styles.stepDesc}>
              Helps us calculate your target aggregate cut-off score.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Intended Course of Study</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Computer Science, Law, Medicine"
                placeholderTextColor={Palette.ink3}
                value={course}
                onChangeText={setCourse}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Institution</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. UNILAG, UI, OAU, UNN"
                placeholderTextColor={Palette.ink3}
                value={university}
                onChangeText={setUniversity}
              />
            </View>
          </View>
        )}

        {/* Step 3: Choose 4 Core Subjects */}
        {step === 3 && (
          <View style={styles.stepBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="book-outline" size={28} color={Palette.accent} />
            </View>
            <Text style={styles.stepTitle}>Select your 4 Exam Subjects</Text>
            <Text style={styles.stepDesc}>
              Selected: {selectedSubjects.length}/4 subjects for your JAMB subject combination.
            </Text>

            <View style={styles.subjectsGrid}>
              {availableSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.slug);
                return (
                  <TouchableOpacity
                    key={sub.slug}
                    style={[styles.subjectChip, isSelected && styles.subjectChipSelected]}
                    onPress={() => toggleSubject(sub.slug)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={isSelected ? Palette.accent : Palette.ink3}
                    />
                    <Text style={[styles.subjectChipText, isSelected && styles.subjectChipTextSelected]}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 4: Learning Style */}
        {step === 4 && (
          <View style={styles.stepBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles-outline" size={28} color={Palette.accent} />
            </View>
            <Text style={styles.stepTitle}>How do you learn best?</Text>
            <Text style={styles.stepDesc}>
              We will tune your daily recommendations to match your preferred flow.
            </Text>

            <View style={styles.optionsList}>
              {[
                { key: 'practice', title: 'Solving Past Questions', desc: 'Learn by drilling real exam questions with explanations' },
                { key: 'visual', title: 'Concept Diagrams & Summaries', desc: 'Digest concise visual cheatsheets and key formula cards' },
                { key: 'reading', title: 'Step-by-Step Walkthroughs', desc: 'Deep dive into full topic explanations and theory' },
                { key: 'mixed', title: 'Balanced Mix', desc: 'Combine reading theory with active past question tests' },
              ].map((item) => {
                const isSelected = learningStyle === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                    onPress={() => setLearningStyle(item.key as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardOptionTextWrap}>
                      <Text style={styles.cardOptionTitle}>{item.title}</Text>
                      <Text style={styles.cardOptionDesc}>{item.desc}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isSelected ? Palette.accent : Palette.ink3}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 5: Daily Target */}
        {step === 5 && (
          <View style={styles.stepBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="timer-outline" size={28} color={Palette.accent} />
            </View>
            <Text style={styles.stepTitle}>Daily Study Commitment</Text>
            <Text style={styles.stepDesc}>
              Students spending 45–60 mins daily consistently score in the top 5th percentile.
            </Text>

            <View style={styles.minutesRow}>
              {[30, 45, 60, 90].map((mins) => {
                const isSelected = dailyMinutes === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    style={[styles.minuteCard, isSelected && styles.minuteCardSelected]}
                    onPress={() => setDailyMinutes(mins)}
                  >
                    <Text style={[styles.minuteNumber, isSelected && styles.minuteNumberSelected]}>
                      {mins}m
                    </Text>
                    <Text style={[styles.minuteLabel, isSelected && styles.minuteLabelSelected]}>
                      {mins === 60 ? 'Recommended' : 'Daily'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Navigation Step Button */}
        <TouchableOpacity
          style={[styles.continueButton, isLoading && { opacity: 0.6 }]}
          disabled={isLoading}
          onPress={() => {
            if (step < totalSteps) {
              setStep(step + 1);
            } else {
              handleFinish();
            }
          }}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                {step === totalSteps ? 'Generate My Study Roadmap' : 'Next Step'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </>
          )}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Palette.paper2,
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.accent,
    borderRadius: 3,
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink3,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  stepBox: {
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: Palette.ink,
  },
  stepDesc: {
    fontSize: 13,
    color: Palette.ink3,
    lineHeight: 19,
  },
  optionsList: {
    gap: 10,
    marginTop: 8,
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Palette.rule,
  },
  cardOptionSelected: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentTint,
  },
  cardOptionTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  cardOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.ink,
  },
  cardOptionDesc: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  inputGroup: {
    gap: 6,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink2,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: Palette.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: Palette.ink,
  },
  subjectsGrid: {
    gap: 8,
    marginTop: 8,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 10,
  },
  subjectChipSelected: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentTint,
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
  subjectChipTextSelected: {
    color: Palette.accent,
    fontWeight: '700',
  },
  minutesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  minuteCard: {
    flex: 1,
    backgroundColor: Palette.card,
    borderRadius: 14,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: Palette.rule,
    alignItems: 'center',
    gap: 4,
  },
  minuteCardSelected: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentTint,
  },
  minuteNumber: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
  },
  minuteNumberSelected: {
    color: Palette.accent,
  },
  minuteLabel: {
    fontSize: 10,
    color: Palette.ink3,
    textTransform: 'uppercase',
  },
  minuteLabelSelected: {
    color: Palette.accent,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: Palette.accent,
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
