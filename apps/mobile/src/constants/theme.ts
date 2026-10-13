import { Platform } from 'react-native';

export const Palette = {
  // Light Paper surfaces
  paper: '#FBF9F4',
  paper2: '#F4F1EA',
  paper3: '#ECE7DD',
  card: '#FFFFFF',
  ink: '#1A1814',
  ink2: '#4A463E',
  ink3: '#7C766B',
  rule: '#E5DFD2',
  rule2: '#D9D2C2',

  // Accent - Warm Aubergine
  accent: '#6E3A5F',
  accent2: '#56294A',
  accentTint: '#F2E8EE',

  // Functional
  success: '#2F6B3F',
  successTint: '#E8F5EC',
  warning: '#B87A1F',
  warningTint: '#FDF3E3',
  danger: '#A82F2F',
  dangerTint: '#FDE8E8',

  // Subject hues
  english: '#3F5B7F',
  math: '#6B4E8F',
  physics: '#2F6B6B',
  chemistry: '#8E5A2B',
  biology: '#4F7A3F',
  economics: '#8E7F2B',
  government: '#7F4A35',
  literature: '#3F5A8E',
  defaultSubject: '#7C766B',

  // Compatibility aliases
  text: '#1A1814',
  background: '#FBF9F4',
  backgroundElement: '#F4F1EA',
  backgroundSelected: '#ECE7DD',
  textSecondary: '#4A463E',
};

export const DarkPalette = {
  paper: '#14130F',
  paper2: '#1C1A15',
  paper3: '#25221C',
  card: '#1A1813',
  ink: '#F4F0E6',
  ink2: '#BAB3A2',
  ink3: '#7C766B',
  rule: '#2D2A23',
  rule2: '#3A362D',

  accent: '#B07A9D',
  accent2: '#99668A',
  accentTint: '#2A1E25',

  success: '#388E4E',
  successTint: '#1A2E1E',
  warning: '#D48D28',
  warningTint: '#2E2210',
  danger: '#C73838',
  dangerTint: '#2E1414',

  english: '#5B7FA8',
  math: '#8C6DB8',
  physics: '#459292',
  chemistry: '#B87B45',
  biology: '#6DA359',
  economics: '#B8A845',
  government: '#A8694F',
  literature: '#5B7CB8',
  defaultSubject: '#8E877B',

  // Compatibility aliases
  text: '#F4F0E6',
  background: '#14130F',
  backgroundElement: '#1C1A15',
  backgroundSelected: '#25221C',
  textSecondary: '#BAB3A2',
};

export const Colors = {
  light: Palette,
  dark: DarkPalette,
};

export type ThemeColor = keyof typeof Palette & keyof typeof DarkPalette;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Fonts = Platform.select({
  ios: {
    serif: 'Georgia',
    sans: 'System',
    mono: 'Menlo',
  },
  android: {
    serif: 'serif',
    sans: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    serif: 'Georgia',
    sans: 'system-ui',
    mono: 'monospace',
  },
});

export const SubjectColors: Record<string, string> = {
  english: Palette.english,
  mathematics: Palette.math,
  physics: Palette.physics,
  chemistry: Palette.chemistry,
  biology: Palette.biology,
  economics: Palette.economics,
  government: Palette.government,
  literature: Palette.literature,
};

export function getSubjectColor(slug: string, isDark = false): string {
  const p = isDark ? DarkPalette : Palette;
  const map: Record<string, string> = {
    english: p.english,
    mathematics: p.math,
    physics: p.physics,
    chemistry: p.chemistry,
    biology: p.biology,
    economics: p.economics,
    government: p.government,
    literature: p.literature,
  };
  return map[slug] ?? p.defaultSubject;
}
