# Propella Mobile App 📱

React Native + Expo mobile application for **Propella**, tailored to replicate and refine the mobile experience of the web application.

## Overview

The mobile app incorporates Propella's warm editorial paper design system (Warm Aubergine accent, light & dark paper surfaces, serif display headers) and provides all 7 core web features:

1. **Dashboard** (`/(tabs)`):
   - Real-time exam countdown (`JAMB UTME 2026`) and readiness percentage ring.
   - Today's Focus topics with subject tags, time estimates, status badges, and one-tap session launches.
   - Flame streak tracking (`🔥 7 Days`), longest streak, and XP rankings.
   - Weak Topics priority section with direct topic drills.
   - Spaced repetition upcoming revisions.
   - Weekly study accuracy trends.

2. **Syllabus Roadmap** (`/(tabs)/roadmap`):
   - Multi-subject tabs (Mathematics, Use of English, Physics, Chemistry, Biology).
   - Subject mastery overview and progress bars.
   - Unit & topic curriculum trees with completion status pills.
   - Instant "Practice" drill action for each topic.

3. **Study Notes & Cheatsheets** (`/(tabs)/notes`):
   - Fast keyword search across formulas, laws, and concepts.
   - Subject filtering pills.
   - High-yield summary cards with key takeaways, formulas, and JAMB tips.
   - Bookmark toggle for offline review.

4. **Student Profile & Settings** (`/(tabs)/settings`):
   - Student profile card with Scholar badge.
   - Target exam switcher (JAMB UTME, WAEC SSCE, NECO).
   - Daily target study minutes selector.
   - Paper Dark Theme and sound/haptics toggles.
   - Offline cached question bank status and sync.

5. **Elevated Center Tools Sheet**:
   - Access from anywhere via the raised center floating aubergine button on the bottom nav bar:
     - 📝 **Practice Quizzes** (`/quizzes`): Targeted topic drills, multiple-choice selection, instant explanation and review.
     - 📑 **Mock Exam Simulator** (`/mocks`): Timed full exam CBT simulation, live countdown clock, question palette grid, and score projection.
     - ⚡ **Marathon Run** (`/marathon`): Fast-paced endurance streak challenge, combo multipliers (`x2` - `x5`), lives counter (❤️❤️❤️).
     - ✨ **AI Study Assistant** (`/assistant`): Interactive AI tutor chat with syllabus-aware prompt chips and step-by-step guidance.
     - 📅 **Study Planner** (`/planner`): Timetable schedule with customizable study blocks and task completion checkboxes.
     - 📈 **Progress & Badges** (`/progress`): Deep analytics, subject mastery bars, and achievement badge trophies.
     - 🏆 **Leaderboard** (`/leaderboard`): Top 3 podium (Gold/Silver/Bronze) and weekly scholar league table.
     - 🔔 **Notifications** (`/notifications`): Study alerts, spaced repetition alerts, and streak milestones.

## Running the App

### From Monorepo Root:
```bash
# Start the Expo development server
pnpm mobile

# Or target specific platforms:
pnpm mobile:android
pnpm mobile:ios
```

### From `apps/mobile`:
```bash
cd apps/mobile
pnpm start
```
