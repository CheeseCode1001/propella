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
import { Palette, Fonts } from '@/constants/theme';
import { mockPlannerDays } from '@/lib/mock-data';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';

export default function PlannerScreen() {
  const router = useRouter();
  const [days, setDays] = useState(mockPlannerDays);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: any }>('/planner');
        if (res?.data?.days && Array.isArray(res.data.days) && res.data.days.length > 0) {
          setDays(res.data.days);
        }
      } catch {}
    }
    load();
  }, []);

  const activeDay = days[selectedDayIndex] || days[0];

  function toggleTaskDone(taskId: string) {
    setDays((prev) =>
      prev.map((day, dIdx) => {
        if (dIdx !== selectedDayIndex) return day;
        return {
          ...day,
          tasks: day.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        };
      })
    );
  }

  function handleAddTask() {
    Alert.prompt
      ? Alert.prompt('New Study Block', 'Enter topic name:', (text) => {
          if (!text) return;
          const newTask = {
            id: `task-${Date.now()}`,
            subject: 'General Prep',
            title: text,
            time: '05:00 PM',
            duration: '30m',
            done: false,
          };
          setDays((prev) =>
            prev.map((day, dIdx) =>
              dIdx === selectedDayIndex
                ? { ...day, tasks: [...day.tasks, newTask] }
                : day
            )
          );
        })
      : Alert.alert('Add Task', 'Added revision block for 05:00 PM (30m)');
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
          <Text style={styles.headerTitle}>Study Planner</Text>
          <Text style={styles.headerSubtitle}>Timetable & targets</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Ionicons name="add" size={22} color={Palette.accent} />
        </TouchableOpacity>
      </View>

      {/* Days Tabs */}
      <View style={styles.daysRow}>
        {days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dayTab,
                isSelected && styles.dayTabSelected,
              ]}
              onPress={() => setSelectedDayIndex(idx)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayTabText,
                  isSelected && styles.dayTabTextSelected,
                ]}
              >
                {day.day}
              </Text>
              <Text
                style={[
                  styles.dayDateText,
                  isSelected && styles.dayDateTextSelected,
                ]}
              >
                {day.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryTitle}>
              {activeDay.tasks.filter((t) => t.done).length} of{' '}
              {activeDay.tasks.length} tasks completed
            </Text>
            <Text style={styles.summarySubtitle}>
              Target: 75 total minutes of focused revision
            </Text>
          </View>
        </View>

        {/* Task list */}
        <View style={styles.tasksList}>
          {activeDay.tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskCard,
                task.done && styles.taskCardDone,
              ]}
              activeOpacity={0.8}
              onPress={() => toggleTaskDone(task.id)}
            >
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  task.done && styles.checkboxDone,
                ]}
                onPress={() => toggleTaskDone(task.id)}
              >
                {task.done && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <View style={styles.taskInfo}>
                <View style={styles.taskMetaRow}>
                  <Text style={styles.taskSubject}>{task.subject}</Text>
                  <Text style={styles.taskTime}>
                    {task.time} • {task.duration}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.taskTitle,
                    task.done && styles.taskTitleDone,
                  ]}
                >
                  {task.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rule,
  },
  dayTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.rule,
    alignItems: 'center',
  },
  dayTabSelected: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  dayTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.ink,
  },
  dayTabTextSelected: {
    color: '#FFFFFF',
  },
  dayDateText: {
    fontSize: 10,
    color: Palette.ink3,
    marginTop: 2,
  },
  dayDateTextSelected: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.rule,
  },
  summaryTitle: {
    fontFamily: Fonts?.serif ?? 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: Palette.ink,
  },
  summarySubtitle: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.rule,
    gap: 12,
  },
  taskCardDone: {
    backgroundColor: Palette.paper2,
    opacity: 0.8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Palette.rule2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  taskInfo: {
    flex: 1,
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.accent,
    textTransform: 'uppercase',
  },
  taskTime: {
    fontSize: 11,
    color: Palette.ink3,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: Palette.ink3,
  },
});
