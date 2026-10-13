import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts, getSubjectColor } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopicDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const subjectSlug = (params.subjectSlug as string) || 'physics';
  const topicTitle = (params.title as string) || 'Photoelectric Effect & Quantum Physics';

  const subjectColor = getSubjectColor(subjectSlug);

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
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerSubject, { color: subjectColor }]}>
            {subjectSlug.toUpperCase()}
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {topicTitle}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => {}}
        >
          <Ionicons name="bookmark-outline" size={20} color={Palette.ink2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Topic Title Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.subjectBadge, { backgroundColor: `${subjectColor}15` }]}>
            <Text style={[styles.subjectBadgeText, { color: subjectColor }]}>
              Official JAMB Syllabus • Unit 2
            </Text>
          </View>
          <Text style={styles.heroTitle}>{topicTitle}</Text>
          <Text style={styles.heroSummary}>
            The emission of electrons when electromagnetic radiation shines on a metal surface. First explained by Albert Einstein using Planck's quantum theory.
          </Text>
        </View>

        {/* Section 1: Core Principles */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>1. Fundamental Principles</Text>
          <View style={styles.pointList}>
            <View style={styles.pointItem}>
              <View style={[styles.dot, { backgroundColor: subjectColor }]} />
              <Text style={styles.pointText}>
                <Text style={styles.bold}>Photon Quanta: </Text>
                Light behaves as packets of discrete energy called photons, where E = hf (h = 6.63 × 10⁻³⁴ J·s).
              </Text>
            </View>
            <View style={styles.pointItem}>
              <View style={[styles.dot, { backgroundColor: subjectColor }]} />
              <Text style={styles.pointText}>
                <Text style={styles.bold}>Threshold Frequency (f₀): </Text>
                Minimum frequency of incident radiation below which no electrons are emitted, regardless of light intensity.
              </Text>
            </View>
            <View style={styles.pointItem}>
              <View style={[styles.dot, { backgroundColor: subjectColor }]} />
              <Text style={styles.pointText}>
                <Text style={styles.bold}>Work Function (W₀): </Text>
                Minimum energy required to liberate an electron from the metal surface (W₀ = hf₀).
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Einstein's Equation & Formulas */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>2. Governing Equations</Text>
          <View style={styles.formulaPill}>
            <Text style={styles.formulaLabel}>Einstein’s Photoelectric Equation:</Text>
            <Text style={styles.formulaEquation}>hf = W₀ + KE_max</Text>
            <Text style={styles.formulaEquation}>hf = hf₀ + ½mv²_max</Text>
          </View>

          <View style={styles.formulaPill}>
            <Text style={styles.formulaLabel}>Stopping Potential (V_s):</Text>
            <Text style={styles.formulaEquation}>KE_max = e · V_s</Text>
          </View>
        </View>

        {/* Section 3: Walkthrough Example */}
        <View style={styles.exampleCard}>
          <View style={styles.exampleHeader}>
            <Ionicons name="calculator-outline" size={18} color={Palette.accent} />
            <Text style={styles.exampleTitle}>Past Question Walkthrough (JAMB)</Text>
          </View>
          <Text style={styles.exampleProblem}>
            A metal has a work function of 3.2 eV. If light of frequency 1.2 × 10¹⁵ Hz falls on it, calculate the maximum kinetic energy of the emitted electrons. (h = 6.63 × 10⁻³⁴ J·s, 1 eV = 1.6 × 10⁻¹⁹ J).
          </Text>

          <View style={styles.stepsBox}>
            <Text style={styles.stepLine}>1. Energy of incident photon: E = hf = (6.63 × 10⁻³⁴)(1.2 × 10¹⁵) = 7.956 × 10⁻¹⁹ J</Text>
            <Text style={styles.stepLine}>2. Convert E to eV: E = 7.956 × 10⁻¹⁹ / 1.6 × 10⁻¹⁹ = 4.97 eV</Text>
            <Text style={styles.stepLine}>3. KE_max = E - W₀ = 4.97 eV - 3.2 eV = 1.77 eV</Text>
          </View>
          <Text style={styles.answerTag}>Answer: KE_max = 1.77 eV (or 2.83 × 10⁻¹⁹ J)</Text>
        </View>

        {/* Section 4: High Yield Tip */}
        <View style={styles.tipBox}>
          <Ionicons name="bulb" size={20} color={Palette.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Crucial JAMB Distinction:</Text>
            <Text style={styles.tipText}>
              • Increasing <Text style={styles.bold}>INTENSITY</Text> increases the NUMBER of emitted electrons (photocurrent).{'\n'}
              • Increasing <Text style={styles.bold}>FREQUENCY</Text> increases the KINETIC ENERGY of the electrons.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.drillButton}
          activeOpacity={0.85}
          onPress={() => router.push('/quizzes')}
        >
          <Ionicons name="checkbox-outline" size={18} color="#FFFFFF" />
          <Text style={styles.drillButtonText}>Practice 10 Questions on This Topic</Text>
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
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerSubject: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 8,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
  },
  heroSummary: {
    fontSize: 13,
    color: Palette.ink2,
    lineHeight: 19,
  },
  sectionCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 12,
  },
  sectionHeading: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: Palette.ink,
  },
  pointList: {
    gap: 10,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  pointText: {
    fontSize: 13,
    color: Palette.ink,
    lineHeight: 19,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  formulaPill: {
    backgroundColor: Palette.paper,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 4,
  },
  formulaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.ink3,
    textTransform: 'uppercase',
  },
  formulaEquation: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: Palette.accent,
  },
  exampleCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 10,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exampleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.accent,
  },
  exampleProblem: {
    fontSize: 13,
    color: Palette.ink,
    lineHeight: 19,
  },
  stepsBox: {
    backgroundColor: Palette.paper2,
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  stepLine: {
    fontSize: 12,
    color: Palette.ink2,
    lineHeight: 17,
  },
  answerTag: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.success,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Palette.warningTint,
    padding: 14,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1DCB8',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.warning,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7D5215',
  },
  drillButton: {
    backgroundColor: Palette.accent,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  drillButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
