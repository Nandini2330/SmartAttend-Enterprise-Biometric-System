# SmartAttend — Parent Mobile Application

The official cross-platform Parent Mobile Application for the **SmartAttend School ERP Platform**. Built with React Native, Expo, and TypeScript, and connected directly to the existing Supabase PostgreSQL backend.

---

## 🌟 Key Features

1. **Secure Parent Authentication**:
   - Registered email/mobile + password login with password visibility toggle.
   - Quick testing perspective switcher (`vikram.mehta@gmail.com`, `sunita.kapoor@gmail.com`, `anil.verma@gmail.com`, `pooja.gupta@gmail.com`).
   - Strict zero-trust IDOR parent privacy enforcement.

2. **Multi-Child Switcher**:
   - Parents linked to multiple students (e.g., Vikram Mehta linked to Aarav Mehta [Grade 10-A] and Diya Mehta [Grade 9-B]) can switch perspective with one tap.

3. **Clock In & Clock Out Hero Cards**:
   - **Clock In**: Arrival time, date, verified biometric method (Face Kiosk / Fingerprint), and safe arrival indicator.
   - **Clock Out**: Departure time, date, and safe departure indicator or "Not Checked Out Yet" if student is currently in session.
   - *Read-only parent view*: Records come from school biometric devices.

4. **Attendance History & Ledger**:
   - Monthly, weekly, and all-time ledger views.
   - Attendance % bar with CBSE compliance status (>= 75%).
   - Tapping any date opens a detailed modal with biometric timestamps, verification method, and official school remarks.

5. **Absence & Leave Management**:
   - Parents can submit leave applications with start date, end date, reason, and detailed notes for the teacher.
   - Disclaims that submission requires teacher/admin approval before leave status is confirmed.

6. **School Circulars & Announcements**:
   - Filter circulars by Examinations, Holidays, PTM, and General notices.
   - Download or view attached PDF guidelines.

7. **Push Notifications & Alerts**:
   - Real-time notifications for Clock In, Clock Out, Absence Cutoff, and Leave Approvals.
   - Read/unread indicators and "Mark All as Read".

8. **Bilingual Localization & Theming**:
   - Full English (`EN`) and natural Marathi (`मराठी`) language toggle.
   - Full Light Mode and Dark Mode support with synchronized theme transitions.

---

## 🚀 How to Run Locally

### 1. Start the Expo Development Server

From the repository root:
```bash
npm run dev:mobile
```
Or directly from `apps/mobile`:
```bash
cd apps/mobile
npm start
```

### 2. Testing on Android Phone (Expo Go)
1. Install **Expo Go** from the Google Play Store on your Android device.
2. Ensure your phone and computer are on the same Wi-Fi network.
3. Open the Expo Go app and scan the QR code displayed in the terminal.

### 3. Testing on iPhone (Expo Go)
1. Install **Expo Go** from the Apple App Store on your iPhone.
2. Ensure your iPhone and computer are on the same Wi-Fi network.
3. Open the standard iOS Camera app and scan the terminal QR code, then tap the "Open in Expo Go" banner.

### 4. Testing in Android Emulator
With an Android emulator running:
```bash
cd apps/mobile
npx expo start --android
```

### 5. Testing in iOS Simulator (macOS only)
```bash
cd apps/mobile
npx expo start --ios
```

### 6. Testing in Web Browser
To preview the mobile UI directly in a desktop browser:
```bash
cd apps/mobile
npx expo start --web
```
