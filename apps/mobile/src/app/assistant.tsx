import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export default function AssistantScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Hello! I am your Propella AI Study Assistant. Ask me anything from your JAMB or WAEC syllabus, and I will explain it step-by-step with formulas and past question tips.',
      time: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const promptSuggestions = [
    'Explain Photoelectric Effect simply',
    'How do I find sum & product of quadratic roots?',
    'What is the rule of proximity in Concord?',
    'Give me an IUPAC naming mnemonic',
  ];

  async function handleSend(textToSend?: string) {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let reply = '';
      try {
        const threadRes = await api.post<{ data: { id: string } }>('/assistant/threads', {
          title: query.slice(0, 40),
        });
        if (threadRes?.data?.id) {
          const msgRes = await api.post<{ data: { content: string } }>(
            `/assistant/threads/${threadRes.data.id}/messages`,
            { content: query },
          );
          if (msgRes?.data?.content) {
            reply = msgRes.data.content;
          }
        }
      } catch {
        // Fallback to offline pedagogical intelligence
      }

      if (!reply) {
        reply = 'Here is a breakdown based on the Nigerian syllabus:\n\n';
        if (query.toLowerCase().includes('photoelectric')) {
          reply += '1. The photoelectric effect occurs when photons with energy E = hf strike a metal surface.\n2. If frequency f > threshold frequency f₀, electrons are liberated.\n3. The governing equation is:\n   hf = W₀ + KE_max\n   where W₀ = hf₀ is the Work Function.\n\n💡 JAMB Tip: Higher light intensity ejects MORE electrons, but each electron retains the SAME maximum kinetic energy!';
        } else if (query.toLowerCase().includes('quadratic')) {
          reply += 'For any quadratic equation ax² + bx + c = 0 with roots α and β:\n\n• Sum of roots: α + β = -b/a\n• Product of roots: αβ = c/a\n\nFrequently tested identities:\n• α² + β² = (α + β)² - 2αβ\n• 1/α + 1/β = (α + β) / (αβ)';
        } else if (query.toLowerCase().includes('concord')) {
          reply += 'Rule of Proximity:\nWhen subjects are connected by "either...or" or "neither...nor", the verb agrees with the subject closest to it.\n\nExample:\n• Neither the teacher nor the students were present.\n• Neither the students nor the teacher was present.';
        } else {
          reply += `That is a high-yield concept for JAMB and WAEC. Make sure to review the core definition, key formulas, and solve at least 5 past questions on this topic in the Practice Quizzes tool!`;
        }
      }

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        time: 'Just now',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
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
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>AI Study Tutor</Text>
          <Text style={styles.headerSubtitle}>Syllabus-aware intelligence</Text>
        </View>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color="#6B4E8F" />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <View
                key={m.id}
                style={[
                  styles.msgRow,
                  isUser ? styles.msgRowUser : styles.msgRowAssistant,
                ]}
              >
                {!isUser && (
                  <View style={styles.avatarMini}>
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  </View>
                )}
                <View
                  style={[
                    styles.msgBubble,
                    isUser ? styles.msgBubbleUser : styles.msgBubbleAssistant,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isUser ? styles.msgTextUser : styles.msgTextAssistant,
                    ]}
                  >
                    {m.text}
                  </Text>
                  <Text style={styles.msgTime}>{m.time}</Text>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={styles.typingRow}>
              <View style={styles.avatarMini}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>Tutor is thinking...</Text>
              </View>
            </View>
          )}

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>Suggested syllabus topics:</Text>
              <View style={styles.chipWrap}>
                {promptSuggestions.map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.promptChip}
                    onPress={() => handleSend(prompt)}
                  >
                    <Text style={styles.promptChipText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask a question from your syllabus..."
            placeholderTextColor={Palette.ink3}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !input.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!input.trim()}
            onPress={() => handleSend()}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: Palette.ink,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Palette.ink3,
  },
  aiBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatarMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6B4E8F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
  },
  msgBubbleUser: {
    backgroundColor: Palette.accent,
    borderBottomRightRadius: 4,
  },
  msgBubbleAssistant: {
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.rule,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  msgTextAssistant: {
    color: Palette.ink,
  },
  msgTime: {
    fontSize: 10,
    color: Palette.ink3,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingBubble: {
    backgroundColor: Palette.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  typingText: {
    fontSize: 12,
    color: Palette.ink3,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 16,
    gap: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink3,
    textTransform: 'uppercase',
  },
  chipWrap: {
    gap: 8,
  },
  promptChip: {
    backgroundColor: Palette.paper2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  promptChipText: {
    fontSize: 13,
    color: Palette.ink,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Palette.card,
    borderTopWidth: 1,
    borderTopColor: Palette.rule,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Palette.paper,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.ink,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
