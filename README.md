# Less — Mindful Habit Reduction

<div align="center">
  <h3>"Less, not perfection."</h3>
  <p>A premium Apple-inspired mobile wellness application to help users understand, reflect on, and gradually reduce unwanted habits without shame or guilt.</p>

  [![Direct APK Download](https://img.shields.io/badge/Download_APK-Direct_Install-7C6BF0?style=for-the-badge&logo=android&logoColor=white)](https://github.com/ZahinArman/lessFap/releases/latest)
  [![Build Status](https://img.shields.io/github/actions/workflow/status/ZahinArman/lessFap/build-apk.yml?style=for-the-badge&logo=github&label=APK%20Build)](https://github.com/ZahinArman/lessFap/actions)
  [![Expo SDK 57](https://img.shields.io/badge/Expo-SDK_57-black?style=for-the-badge&logo=expo)](https://docs.expo.dev/)
  [![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-informational?style=for-the-badge)]()
</div>

---

## 📥 Direct Android APK Installation

You can download and install the Android app directly on your phone:

### [👉 Click Here to Download Latest APK (GitHub Releases)](https://github.com/ZahinArman/lessFap/releases/latest)

> **Alternatively**, after each commit, the latest build is also available as an artifact under the [GitHub Actions tab](https://github.com/ZahinArman/lessFap/actions).

### Quick Installation Guide (Android):
1. Tap the download link above on your Android phone to download `lessFap.apk`.
2. Once downloaded, open the `.apk` from your notification bar or **Downloads** folder.
3. If Android displays *"Install unknown apps"*, tap **Settings** and toggle **"Allow from this source"**.
4. Tap **Install**, then tap **Open** to begin using **Less**.

---

## 🌿 Product Philosophy

Many people try to change unwanted habits using rigid streak counters and all-or-nothing challenges. When an unbroken streak ends, discouragement and guilt often lead straight back into the old pattern.

**Less takes a completely different approach:**
- **Less, not perfection**: Progress is measured in overall reduction and greater mindfulness, not unbroken streaks.
- **No shame or judgment**: Logging is honest and objective. You won't find failure alarms, broken streak animations, or punitive language.
- **Pattern awareness**: Discover peak times, common days, and recurring emotional or situational triggers.
- **Mindful pause**: Built-in guided box breathing to help you step back and redirect attention before acting.
- **Local-first privacy**: Your personal reflections, triggers, and habit history never leave your device.

---

## ✨ Features

### 1. 🏠 Home Dashboard
- **Personalized Greeting**: Time-aware greeting adapting throughout the day.
- **Weekly Progress Grid**: 7-day visual grid displaying active vs clean days.
- **Comparative Metrics**: *This week* vs *Last week* vs *Personal Goal* with mindful trend indicators (*Reducing*, *Steady*, *More*).
- **"+ Log" Action**: Fast, judgment-free logging in seconds.
- **Guided Mindfulness**: One-tap access to guided box breathing (*"Pause for a moment"*).
- **Pattern Insights**: Dynamic observation cards generated from local data.

### 2. 📝 Quick & Private Logging
- **Accurate Timestamps**: Editable native date & time picker for logging past events.
- **Situational Triggers**: Boredom, Stress, Loneliness, Habit / Automatic, Sleep Difficulty, Emotional Discomfort, and more.
- **Mood Tracking**: Optional mood context (*Good*, *Okay*, *Difficult*, *Mixed*).
- **Rotating Reflection Prompts**: Mindful questions that prompt awareness rather than guilt.
- **Duplicate Prevention**: Safeguards against accidental double taps within 2 minutes.

### 3. 📅 Monthly Calendar with Density Dots
- Full 42-day navigable monthly calendar.
- Subtle dot density system (`•` 1 log, `••` 2 logs, `•••` 3+ logs).
- Interactive **Day Inspection Sheet** showing event times, triggers, and privacy-masked reflections.
- Proper handling of leap years and partial calendar months (*"September so far: 12 events"*).

### 4. 📊 Insights & Pattern Analysis
- **Time-of-Day Distribution**: Morning (5 AM–12 PM), Afternoon (12 PM–5 PM), Evening (5 PM–10 PM), and Night (10 PM–5 AM).
- **Day-of-Week Distribution**: Monday through Sunday frequency analysis highlighting weekend patterns.
- **Trigger Breakdown**: Ranked percentages for situational triggers.
- **6-Week Trend Chart**: Historical weekly progression.
- **Data Confidence Thresholds**:
  - `< 5 logs`: No premature or speculative pattern claims.
  - `5–9 logs`: Tentative observations marked with *"Based on limited data"*.
  - `10+ logs`: Reliable pattern summaries.

### 5. 🔔 Smart Local Notifications
- **Pattern-Based Alerts**: Infrequent mindful reminders scheduled 1 hour before peak habit hours.
- **Weekly & Monthly Reflections**: Scheduled review check-ins.
- **Quiet Hours**: Protected quiet periods (default: 22:00 – 07:00).
- **Cooldown Safeguard**: Minimum 8-hour cooldown between pattern alerts.
- **Privacy Mode**: Minimal preview text to protect notifications from lock screen exposure.

### 6. ⚙️ Profile, Goals & Data Privacy
- **Goal Editor**: Switch between *Gradual reduction*, *Personal weekly target* (with a 1–30 stepper), *Awareness & reflection*, or *Intentional abstinence*. Changing goals never erases past data.
- **Data Export**: Export your complete log history as a clean JSON file via the native share sheet.
- **Local Wipe**: Delete all data and reset the app anytime.

---

## 🛠️ Technology Stack

- **Framework**: [Expo SDK 57](https://expo.dev)
- **Runtime**: React Native 0.86, React 19.2 (New Architecture enabled)
- **Navigation**: [Expo Router v57](https://docs.expo.dev/router/introduction/) (file-based navigation)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Local Persistence**: `@react-native-async-storage/async-storage` & `expo-secure-store`
- **Animations**: `react-native-reanimated` 4.5.1
- **Icons**: `phosphor-react-native`
- **Typography**: `@expo-google-fonts/inter`
- **Charts**: `react-native-gifted-charts`
- **Dates**: `date-fns`

---

## 💻 Local Development

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+ recommended)
- [Expo Go](https://expo.dev/go) on your iOS or Android device

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Start Development Server
```bash
npx expo start
```
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for Web
- Or scan the QR code with **Expo Go**

---

## 🏗️ Building Standalone APK with EAS

You can also trigger a cloud build using EAS CLI:

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build standalone APK
eas build -p android --profile preview
```

---

## 🔒 Privacy Guarantee

Less does **not** use analytics trackers, third-party user databases, or cloud sync servers. All your behavior logs, triggers, reflections, and settings remain solely on your device.

---

## 📄 License

MIT License. Built with intention.
