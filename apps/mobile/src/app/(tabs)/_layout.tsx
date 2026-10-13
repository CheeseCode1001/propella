import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Fonts } from '@/constants/theme';
import { ToolsSheetModal } from '@/components/tools-sheet-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 64 + (insets.bottom > 0 ? insets.bottom - 4 : 6),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            backgroundColor: Palette.paper,
            borderTopWidth: 1,
            borderTopColor: Palette.rule,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.03,
            shadowRadius: 3,
          },
          tabBarActiveTintColor: Palette.accent,
          tabBarInactiveTintColor: Palette.ink3,
          tabBarLabelStyle: {
            fontFamily: Fonts?.sans ?? 'sans-serif',
            fontSize: 10,
            fontWeight: '600',
            marginTop: -2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="roadmap"
          options={{
            title: 'Roadmap',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'book' : 'book-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />

        {/* Floating Raised Center Button: Tools (matches web 56x56 raised aubergine button) */}
        <Tabs.Screen
          name="tools-trigger"
          options={{
            title: '',
            tabBarButton: () => (
              <View style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.centerButton}
                  onPress={() => setToolsOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Study Tools"
                >
                  <Ionicons name="grid" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setToolsOpen(true);
            },
          }}
        />

        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      {/* Interactive Tools Sheet */}
      <ToolsSheetModal
        visible={toolsOpen}
        onClose={() => setToolsOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Palette.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 8,
  },
});

