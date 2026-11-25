# SmartAttend — Production Cloud Deployment Guide

This guide details deploying the SmartAttend web application, Python microservice, biometric device bridge, Edge Functions, and database to enterprise production environments.

---

## 1. Architecture Deployment Topology

```text
[Internet / School Campuses]
         │
         ├── HTTPS / Port 443 ──► [Vercel / Cloudflare Pages] (Web Dashboard)
         │
         ├── HTTPS / Port 443 ──► [Google Play Store / Expo] (Android Parent App)
         │
         ├── HTTPS / Port 443 ──► [Supabase Managed Cloud]
         │                          ├── PostgreSQL Database + RLS
         │                          ├── Edge Functions (attendance, whatsapp, reconcile)
         │                          └── Realtime Websockets
         │
         ├── HTTPS / Port 8001 ──► [Docker / AWS ECS / Render] (Face Recognition Service)
         │
         └── TCP / VPN ──────────► [School Edge Gateway / Raspberry Pi] (Device Bridge)
                                    └── Local LAN connection to ZKTeco / Mantra Terminals
```

---

## 2. Web Dashboard Deployment (Vercel / Netlify / Cloudflare Pages)

1. Connect your Git repository to **Vercel** or **Cloudflare Pages**.
2. Set the **Root Directory** to `apps/web`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Production Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FACE_SERVICE_URL`
   - `VITE_DEVICE_BRIDGE_URL`

---

## 3. Face Recognition Service (Docker / Linux Server)

A sample production Dockerfile is included under `services/face-recognition/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

Deploy to AWS ECS, Render, or any Linux server with GPU/CPU acceleration.

---

## 4. Supabase Database & Edge Functions Deployment

```bash
# Link to your production Supabase project
supabase link --project-ref your_project_ref

# Push migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy attendance-event --no-verify-jwt
supabase functions deploy whatsapp-send
supabase functions deploy whatsapp-webhook --no-verify-jwt
supabase functions deploy attendance-reconcile

# Set secrets in Supabase Cloud
supabase secrets set WHATSAPP_ACCESS_TOKEN=your_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token
```

---

## 5. Automated Scheduled Cron for Reconciliation

Supabase supports pg_cron directly in PostgreSQL:
```sql
-- Schedule reconciliation daily at 10:05 AM (Asia/Kolkata is UTC+5:30 -> 04:35 UTC)
SELECT cron.schedule(
    'reconcile-attendance-morning',
    '35 4 * * 1-6',
    $$
    SELECT net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/attendance-reconcile',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body := '{"school_id": "11111111-1111-1111-1111-111111111111"}'::jsonb
    );
    $$
);
```
