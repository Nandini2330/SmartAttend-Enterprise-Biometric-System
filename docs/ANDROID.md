# SmartAttend — Android Parent Mobile Application

The SmartAttend Android application (`apps/mobile`) is built with React Native and Expo, providing parents with immediate transparency into their children's school attendance, arrivals, departures, and alerts.

---

## 1. Application Features

1. **Secure Parent Authentication**: Email & password authentication linked directly to the parent's `guardians` record in Supabase.
2. **Multi-Child Switcher**: Allows parents with multiple enrolled siblings to switch between child profiles seamlessly with a single tap.
3. **Today's Attendance Hero**: Instant visual indicator (Green = Present, Amber = Late, Red = Absent, Blue = On Leave) with verification timestamps and methods (Face / Fingerprint / Manual).
4. **Interactive Attendance Calendar**: Month-view calendar displaying color-coded dots for every academic day.
5. **Timeline Feed**: Chronological log of recent gate entry and exit events with camera/terminal locations.
6. **Leave Request Submission**: Parents can submit medical or personal leave requests directly to class teachers with automated status updates.
7. **School Direct Contact**: One-tap phone and email shortcut to the school reception desk.

---

## 2. Development Setup

### Running with Expo Go (Physical Android Phone or Emulator)
```bash
# Navigate to mobile app directory
cd apps/mobile

# Start Expo development server
npm start
```

- **Physical Device**: Install **Expo Go** from Google Play Store. Scan the QR code displayed in the terminal.
- **Android Studio Emulator**: Press `a` in the terminal to launch the app inside your running Android Virtual Device (AVD).

---

## 3. Building Release APKs (EAS Build)

To build standalone APKs or Google Play App Bundles (.aab), use Expo Application Services (EAS):

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Log in to your Expo account
eas login

# 3. Configure the build project
eas build:configure

# 4. Generate standalone Android APK for direct testing
eas build -p android --profile preview

# 5. Generate signed Android App Bundle (AAB) for Google Play Store
eas build -p android --profile production
```

---

## 4. Native Permissions & Privacy Policy

The parent app strictly limits requested Android permissions:
- `INTERNET`: Required for communicating with Supabase API.
- `CAMERA`: Optional — used solely if the parent chooses to upload profile photos or supporting medical certificates for leave requests.
- No location tracking, contacts reading, or background surveillance permissions are ever requested.
