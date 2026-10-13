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
      description: 'Today and this week',
      icon: 'calendar-outline' as const,
      href: '/planner',
    },
    {
      id: 'quizzes',
      title: 'Practice Quizzes',
      description: 'Practice by topic',
      icon: 'checkbox-outline' as const,
      href: '/quizzes',
    },
    {
      id: 'mocks',
      title: 'Mock Exams',
      description: 'Full exam simulations',
      icon: 'document-text-outline' as const,
      href: '/mocks',
    },
    {
      id: 'marathon',
      title: 'Marathon',
      description: 'Long focused runs',
      icon: 'flash-outline' as const,
      href: '/marathon',
    },
    {
      id: 'assistant',
      title: 'AI Assistant',
      description: 'Ask anything from your syllabus',
      icon: 'sparkles-outline' as const,
      href: '/assistant',
    },
    {
      id: 'progress',
      title: 'Progress & Mastery',
      description: 'Mastery, streaks, trends',
      icon: 'trending-up-outline' as const,
      href: '/progress',
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'How you rank this week',
      icon: 'trophy-outline' as const,
      href: '/leaderboard',
    },
    {
      id: 'files',
      title: 'Course Files',
      description: '100L-500L lecture notes & past papers',
      icon: 'folder-open-outline' as const,
      href: '/files',
    },
  ];

  function handleSelect(href: string) {
    onClose();
    setTimeout(() => {
      router.push(href as any);
    }, 120);
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

              {/* Header matching web tools sheet */}
              <View style={styles.headerRow}>
                <Text style={styles.sheetTitle}>Tools</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityLabel="Close tools"
                >
                  <Ionicons name="close" size={20} color={Palette.ink3} />
                </TouchableOpacity>
              </View>

              {/* Tool List matching web rows */}
              <ScrollView
                style={styles.toolList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {tools.map((tool, idx) => (
                  <TouchableOpacity
                    key={tool.id}
                    style={[
                      styles.toolRow,
                      idx < tools.length - 1 && styles.toolRowBorder,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(tool.href)}
                  >
                    <View style={styles.iconBox}>
                      <Ionicons
                        name={tool.icon}
                        size={20}
                        color={Palette.ink}
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
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Palette.paper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 28,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.rule2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
  },
  sheetTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: Palette.ink,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 64,
    gap: 16,
  },
  toolRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  toolItemTitle: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 16,
    fontWeight: '600',
    color: Palette.ink,
  },
  toolItemDesc: {
    fontFamily: Fonts?.sans ?? 'sans-serif',
    fontSize: 13,
    color: Palette.ink2,
    marginTop: 2,
  },
});

