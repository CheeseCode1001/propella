import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { usePaywallStore } from '@/lib/paywall-store';

export function PaywallModal() {
  const isOpen = usePaywallStore((s) => s.isOpen);
  const feature = usePaywallStore((s) => s.feature);
  const closePaywall = usePaywallStore((s) => s.closePaywall);

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'full'>('monthly');

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Scholar Monthly',
      price: '₦3,500',
      period: 'per month',
      badge: 'Popular',
      desc: 'Full access for 30 days',
    },
    {
      id: 'full' as const,
      name: 'Full Season Pass',
      price: '₦9,500',
      period: 'until exam day',
      badge: 'Best Value (Save 40%)',
      desc: 'All subjects + unlimited mocks & AI',
    },
  ];

  const features = [
    '6,994+ Authentic JAMB & WAEC CBT Past Questions',
    'Unlimited Timed Exam Mode CBT Simulations',
    '24/7 AI Tutor with Step-by-Step Solutions',
    'Complete Syllabus Roadmaps for All 12 Subjects',
    'Undergraduate 100L-500L Course Vault & Notes',
    'Predictive JAMB Score & Performance Analytics',
  ];

  function handleSubscribe() {
    Alert.alert(
      'Paystack Checkout',
      `Proceed to Paystack secure payment for ${
        selectedPlan === 'monthly' ? 'Scholar Monthly (₦3,500)' : 'Full Season Pass (₦9,500)'
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay with Paystack',
          onPress: () => {
            closePaywall();
            Alert.alert('Success', 'Welcome to Propella Scholar! Full access unlocked.');
          },
        },
      ]
    );
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={closePaywall}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.crownBadge}>
              <Ionicons name="sparkles" size={24} color={Palette.accent} />
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closePaywall}>
              <Ionicons name="close" size={22} color={Palette.ink2} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>
              {feature ? `Unlock ${feature}` : 'Upgrade to Propella Scholar'}
            </Text>
            <Text style={styles.subtitle}>
              Over 12,000 Nigerian students trust Propella to score 300+ in JAMB & straight A’s in WAEC.
            </Text>

            {/* Plans Selector */}
            <View style={styles.plansContainer}>
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPlan(p.id)}
                  >
                    <View style={styles.planTopRow}>
                      <View>
                        <Text style={styles.planName}>{p.name}</Text>
                        <Text style={styles.planDesc}>{p.desc}</Text>
                      </View>
                      <View style={styles.radioOuter}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </View>
                    <View style={styles.planPriceRow}>
                      <Text style={styles.planPrice}>{p.price}</Text>
                      <Text style={styles.planPeriod}>/ {p.period}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Features List */}
            <View style={styles.featureBox}>
              <Text style={styles.featuresHeading}>Everything included in Scholar:</Text>
              {features.map((item, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Palette.success} />
                  <Text style={styles.featureText}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85} onPress={handleSubscribe}>
              <Text style={styles.checkoutBtnText}>
                Subscribe with Paystack
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.secureText}>
              🔒 Secured by Paystack. Card, Bank Transfer, USSD & Apple Pay supported.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,24,20,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Palette.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  crownBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  title: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: Palette.ink,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.ink3,
  },
  plansContainer: {
    gap: 10,
  },
  planCard: {
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Palette.rule,
    gap: 8,
  },
  planCardSelected: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentTint,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.ink,
  },
  planDesc: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Palette.rule2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.accent,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planPrice: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
  },
  planPeriod: {
    fontSize: 12,
    color: Palette.ink3,
  },
  featureBox: {
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 10,
  },
  featuresHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink2,
    textTransform: 'uppercase',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: Palette.ink,
    flex: 1,
  },
  checkoutBtn: {
    backgroundColor: Palette.accent,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secureText: {
    fontSize: 11,
    textAlign: 'center',
    color: Palette.ink3,
  },
});
