# SmartAttend — Comprehensive Setup Guide

This guide details setting up the entire SmartAttend monorepo locally, connecting Supabase, starting the biometric services, and verifying end-to-end communication.

---

## 1. System Prerequisites

Ensure the following tools are installed:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **Python**: 3.10+ with `pip` (`python --version`)
- **Supabase CLI** (optional for local edge functions, or use Supabase Cloud)
- **Expo Go App** (on Android smartphone for physical mobile preview)

---

## 2. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Review and configure your `.env` variables:
```ini
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Face Recognition Python Microservice
FACE_SERVICE_URL=http://localhost:8001
FACE_SERVICE_API_KEY=smartattend_face_service_dev_key_secret
FACE_CONFIDENCE_THRESHOLD=0.60
FACE_LIVENESS_ENABLED=true

# Biometric Device Bridge (Fingerprint Hardware)
DEVICE_BRIDGE_PORT=8002
DEVICE_BRIDGE_API_KEY=smartattend_device_bridge_key_secret
DEVICE_BRIDGE_MODE=simulator # Switch to 'hardware' when physical scanner is connected

# WhatsApp Cloud API
WHATSAPP_API_VERSION=v20.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_access_token
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
```

---

## 3. Database Migration & Seeding (Supabase)

### Option A: Using Supabase Dashboard (Cloud)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Run the schema migration: `supabase/migrations/20261029000001_initial_schema.sql`.
4. Run the RLS policy script: `supabase/migrations/20261029000002_rls_policies.sql`.
5. Run the seed data script: `supabase/seed.sql`.

### Option B: Using Supabase CLI (Local Development)
```bash
supabase start
supabase db reset
```

---

## 4. Installing Monorepo Dependencies

From the project root:
```bash
npm install
```
This installs dependencies across:
- `packages/shared-types`
- `apps/web`
- `apps/mobile`
- `services/device-bridge`

---

## 5. Starting the Services

### A. Web Dashboard (Port 5173)
```bash
npm run dev:web
```
Access at `http://localhost:5173`.
- Demo Super Admin: `admin@smartattend.io`
- Demo Principal: `principal@dpsrkpuram.edu.in`
- Demo Teacher: `rajesh.kumar@dpsrkpuram.edu.in`
- Demo Parent: `vikram.mehta@gmail.com`

### B. Python Face Recognition Microservice (Port 8001)
```bash
cd services/face-recognition
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001 --reload
```
Interactive OpenAPI documentation available at `http://localhost:8001/docs`.

### C. Fingerprint Device Bridge (Port 8002)
```bash
npm run dev:bridge
```
Starts the hardware adapter service. In `simulator` mode, use the interactive web monitor or POST `/api/v1/devices/punch` to generate real-time biometric punches.

### D. Android Parent Mobile App (Expo Metro Port 8081)
```bash
npm run dev:mobile
```
Press `a` to open in Android Emulator, or scan the QR code using the **Expo Go** application on your physical Android phone.

---

## 6. End-to-End Verification Checklist

1. [ ] Web dashboard opens and shows 6 seeded students.
2. [ ] Device management page shows ZKTeco and Face Kiosk status as `ONLINE`.
3. [ ] Triggering a test punch updates the Live Attendance ticker instantly.
4. [ ] Running absence reconciliation marks unverified students as `ABSENT` and queues WhatsApp notifications.
5. [ ] Parent mobile app displays linked student (e.g. Aarav Mehta) with real-time arrival timestamps.
