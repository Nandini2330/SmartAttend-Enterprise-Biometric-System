# SmartAttend 🎓⚡
> **Every Student. Every Attendance. Every Time.**

SmartAttend is an enterprise-grade Student Attendance Management Platform engineered for modern educational institutions. It delivers real-time biometric verification (Face Recognition with anti-spoofing liveness protection & Fingerprint terminal integration), automated parent notifications via the Meta WhatsApp Cloud API, an interactive web dashboard for school administrators and educators, and a native Android parent application.

---

## 🌟 Key Highlights

- **🏫 Enterprise School Dashboard (`apps/web`)**: Polished SaaS interface built with React 19, TypeScript, Vite, Tailwind CSS, Lucide icons, and Recharts. Role-scoped views for Super Admins, Principals, and Teachers.
- **📱 Android Parent App (`apps/mobile`)**: Native mobile experience built with Expo and React Native. Multi-child selector, real-time arrival/departure timeline, color-coded attendance calendar, leave requests, and notification center.
- **👁️ Real Face Recognition Service (`services/face-recognition`)**: Python microservice featuring computer vision face detection, quality analysis (blurriness, illumination, eye alignment), presentation attack/liveness verification, 512-d feature vector template matching, and anti-replay protection.
- **👆 Biometric Device Bridge (`services/device-bridge`)**: Adapter-driven hardware bridge supporting ZKTeco, Mantra, and SecuGen terminals over TCP/IP, with offline sync buffer replay and an explicitly labelled developer simulator.
- **💬 Meta WhatsApp Cloud API**: Production-ready server-side provider sending authorized template messages for verified arrivals, cutoff absence alerts, and departures, backed by delivery webhook reconciliation.
- **⚡ Automated Absence Engine**: Edge Functions and PostgreSQL cron workers reconciling arrival events against school opening and grace periods, auto-marking absences after cutoff, and queuing alert jobs safely.
- **🛡️ Row Level Security & Privacy Compliance**: Zero raw biometric images stored in primary databases; vector embeddings isolated; strict school-scoped RLS and parent-child authorization barriers.

---

## 📁 Repository Structure

```text
SmartAttend/
├── apps/
│   ├── web/                    # React + Vite administrator & teacher dashboard
│   └── mobile/                 # React Native (Expo) Android parent application
├── services/
│   ├── face-recognition/       # Python FastAPI computer vision & liveness microservice
│   └── device-bridge/          # TypeScript adapter service for fingerprint terminals
├── supabase/
│   ├── migrations/             # Schema definitions and Row Level Security policies
│   ├── functions/              # Deno Edge Functions (attendance, whatsapp, reconcile)
│   └── seed.sql                # Production-grade demonstration dataset
├── packages/
│   └── shared-types/           # Shared TypeScript contracts across frontend & backend
├── docs/
│   ├── SETUP.md                # Local environment setup and initialization guide
│   ├── BIOMETRICS.md           # Face recognition model, pipeline & terminal guide
│   ├── WHATSAPP.md             # Meta WhatsApp Cloud API setup, templates & webhooks
│   ├── ANDROID.md              # Android parent app development & APK release guide
│   ├── DEPLOYMENT.md           # Production cloud deployment & infrastructure guide
│   └── HARDWARE_CHECKLIST.md   # Biometric device compatibility matrix & verification
├── .env.example                # Standard environment configuration template
└── README.md                   # System overview and entry point
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested with v24.x) & npm
- **Python**: 3.10+ (for Face Recognition Service)
- **Supabase Account / CLI** (for PostgreSQL database & Edge Functions)
- **Expo CLI** (for Android Parent App)

### 2. Monorepo Installation
```bash
# Clone the repository
git clone https://github.com/your-org/smartattend.git
cd smartattend

# Copy environment variables
cp .env.example .env

# Install dependencies across all workspaces
npm install
```

### 3. Running Services Locally

| Component | Port | Command |
|---|---|---|
| **Web Dashboard** | `5173` | `npm run dev:web` |
| **Android Parent App** | `8081` | `npm run dev:mobile` |
| **Face Recognition API** | `8001` | `cd services/face-recognition && python -m uvicorn app.main:app --port 8001 --reload` |
| **Fingerprint Bridge** | `8002` | `npm run dev:bridge` |

For detailed step-by-step instructions, refer to [SETUP.md](file:///docs/SETUP.md).

---

## ⚖️ Real Integration vs. Simulation Policy

To guarantee enterprise transparency, SmartAttend strictly labels operational states:

| Feature | Development Mode | Production Requirement |
|---|---|---|
| **Web Dashboard** | Interactive local mock store / Supabase seed dataset | Live Supabase PostgreSQL with RLS enforcement |
| **Face Recognition** | Local webcam with OpenCV Haar & Laplacian liveness check | Calibrated kiosk hardware, verified illumination, vector vault |
| **Fingerprint Device** | Labelled Simulator emitting synthetic biometric punches | ZKTeco / Mantra terminal hooked via TCP or USB SDK driver |
| **WhatsApp Notifications** | Mock provider simulating webhook status callbacks | Meta Business Cloud API with approved Meta templates & wamid receipts |

---

## 📜 Documentation Links

- [Complete Setup Guide](file:///docs/SETUP.md)
- [Biometrics & Liveness Architecture](file:///docs/BIOMETRICS.md)
- [Meta WhatsApp Cloud Integration](file:///docs/WHATSAPP.md)
- [Android Parent App Guide](file:///docs/ANDROID.md)
- [Production Deployment](file:///docs/DEPLOYMENT.md)
- [Hardware Compatibility Matrix](file:///docs/HARDWARE_CHECKLIST.md)

---
*SmartAttend — Designed for safety, speed, and real-time reliability.*
