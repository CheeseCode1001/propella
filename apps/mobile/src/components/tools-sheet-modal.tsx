import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';

interface ToolsSheetModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ToolsSheetModal({ visible, onClose }: ToolsSheetModalProps) {
  const router = useRouter();

  const tools = [
    {
      id: 'planner',
      title: 'Study Planner',
      description: 'Today’s schedule & weekly timetable',
      icon: 'calendar-outline' as const,
      color: '#3F5B7F',
      href: '/planner',
    },
    {
      id: 'quizzes',
      title: 'Practice Quizzes',
      description: 'Targeted topic drills & instant explanations',
      icon: 'checkbox-outline' as const,
      color: Palette.accent,
      href: '/quizzes',
    },
    {
      id: 'mocks',
      title: 'Mock Exams',
      description: 'Timed full JAMB & WAEC simulations',
      icon: 'document-text-outline' as const,
      color: '#8E5A2B',
      href: '/mocks',
    },
    {
      id: 'marathon',
      title: 'Marathon Run',
      description: 'Fast-paced endurance streak challenge',
      icon: 'flash-outline' as const,
      color: Palette.warning,
      href: '/marathon',
    },
    {
      id: 'assistant',
      title: 'AI Study Assistant',
      description: 'Ask anything from your Nigerian syllabus',
      icon: 'sparkles-outline' as const,
      color: '#6B4E8F',
      href: '/assistant',
    },
    {
      id: 'progress',
      title: 'Progress & Mastery',
      description: 'Track weak areas, trends & achievements',
      icon: 'trending-up-outline' as const,
      color: Palette.success,
      href: '/progress',
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'Weekly student ranks & XP race',
      icon: 'trophy-outline' as const,
      color: '#B87A1F',
      href: '/leaderboard',
    },
    {
      id: 'files',
      title: 'Course Files Vault',
      description: '100L-500L lecture notes & past papers',
      icon: 'folder-open-outline' as const,
      color: '#3F5B7F',
      href: '/files',
    },
  ];

  function handleSelect(href: string) {
    onClose();
    setTimeout(() => {
      router.push(href as any);
    }, 150);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.sheetTitle}>Study Tools</Text>
                  <Text style={styles.sheetSubtitle}>
                    All your prep essentials in one place
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={Palette.ink2} />
                </TouchableOpacity>
              </View>

              {/* Tool List */}
              <ScrollView
                style={styles.toolList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {tools.map((tool) => (
                  <TouchableOpacity
                    key={tool.id}
                    style={styles.toolCard}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(tool.href)}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: `${tool.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={tool.icon}
                        size={22}
                        color={tool.color}
                      />
                    </View>
                    <View style={styles.toolTextWrap}>
                      <Text style={styles.toolItemTitle}>{tool.title}</Text>
                      <Text style={styles.toolItemDesc}>
                        {tool.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Palette.ink3}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Palette.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 32,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.rule2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
  },
  sheetTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
  },
  sheetSubtitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolList: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 16,
    gap: 8,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTextWrap: {
    flex: 1,
  },
  toolItemTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 15,
    fontWeight: '600',
    color: Palette.ink,
  },
  toolItemDesc: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
});
