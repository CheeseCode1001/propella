import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
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
            height: 64 + (insets.bottom > 0 ? insets.bottom - 4 : 8),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            backgroundColor: Palette.paper,
            borderTopWidth: 1,
            borderTopColor: Palette.rule,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
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

        {/* Dummy Tab slot for the Raised Centre Tools Button */}
        <Tabs.Screen
          name="tools-trigger"
          options={{
            title: '',
            tabBarButton: () => (
              <View style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.centerButton}
                  onPress={() => setToolsOpen(true)}
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Palette.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
