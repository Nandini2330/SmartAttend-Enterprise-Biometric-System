# SmartAttend — Meta WhatsApp Cloud API Integration Guide

This document outlines the architecture, configuration, template lifecycle, and delivery tracking of automated parent attendance notifications via the official Meta WhatsApp Business Platform Cloud API.

---

## 1. Architectural Flow

```text
[Attendance Verified / Reconciliation Cutoff]
                   │
                   ▼
[1. Queue Notification Job in Supabase]
  ├── Select Guardian phone (E.164 e.g. +919811122233)
  ├── Render Template parameters [Child Name, Time, Date, Status]
  └── Status: 'QUEUED'
                   │
                   ▼
[2. Edge Function: whatsapp-send]
  ├── Reads pending notification_jobs
  ├── Validates Meta template schema & parameters
  └── Sends POST request to https://graph.facebook.com/v20.0/{PHONE_ID}/messages
                   │
                   ▼
[3. Meta Cloud API Response]
  ├── Success: Store 'wamid.HBg...' provider ID, mark 'SENT'
  └── Failure: Log error code, increment retry attempts (max 3)
                   │
                   ▼
[4. Inbound Webhook: whatsapp-webhook]
  ├── Meta sends real-time status callbacks (sent -> delivered -> read)
  └── Updates notification_delivery_logs with timestamps
```

---

## 2. Meta WhatsApp Developer Portal Configuration

### Step 1: Create Meta App
1. Visit the [Meta for Developers Portal](https://developers.facebook.com/).
2. Click **Create App** -> Select **Business** type.
3. Add the **WhatsApp** product to your app.

### Step 2: Configure System User & Permanent Token
1. In Meta Business Manager, go to **System Users**.
2. Generate an Access Token with `whatsapp_business_messaging` and `whatsapp_business_management` permissions.
3. Add the token to `.env` as `WHATSAPP_ACCESS_TOKEN`.

### Step 3: Configure Inbound Webhooks
1. In the WhatsApp product settings, select **Configuration**.
2. Enter your Webhook URL:
   `https://<your-project-id>.supabase.co/functions/v1/whatsapp-webhook`
3. Enter the Verify Token configured in your `.env` (`WHATSAPP_VERIFY_TOKEN`).
4. Subscribe to the `messages` field to receive delivery receipts (`sent`, `delivered`, `read`).

---

## 3. Approved Message Templates

Meta requires pre-approved message templates for business-initiated conversations outside the 24-hour service window.

### Template 1: `attendance_arrival_v1`
- **Category**: `UTILITY`
- **Header**: SmartAttend Verified Check-In
- **Body**:
  ```text
  Dear Parent, your child {{1}} has been marked PRESENT at {{2}} on {{3}}. Verification method: {{4}}.
  ```
- **Example Parameters**: `["Aarav Mehta", "08:24 AM", "29-Oct-2026", "Face Recognition"]`

### Template 2: `attendance_absence_v1`
- **Category**: `UTILITY`
- **Header**: Important Attendance Alert
- **Body**:
  ```text
  Dear Parent, {{1}} has NOT been marked present today, {{2}}. School cutoff was {{3}}. If your child is absent with prior notice, ignore this alert. Otherwise, kindly contact school reception immediately.
  ```
- **Example Parameters**: `["Ishaan Gupta", "29-Oct-2026", "10:00 AM"]`

### Template 3: `attendance_departure_v1`
- **Category**: `UTILITY`
- **Header**: SmartAttend Safe Departure
- **Body**:
  ```text
  Dear Parent, your child {{1}} has checked out from school premises at {{2}} on {{3}}. Have a safe commute home.
  ```
- **Example Parameters**: `["Aarav Mehta", "03:30 PM", "29-Oct-2026"]`

---

## 4. Development vs Production Behavior

- **Live Mode**: Set valid Meta credentials. The system will make HTTP calls to Graph API and wait for authentic `wamid` message IDs.
- **Mock Mode**: When `WHATSAPP_ACCESS_TOKEN` is unset or set to dummy values, the system activates the internal Mock Provider. It generates realistic `wamid.HBg...` receipts and logs payloads clearly in the audit trail without throwing runtime exceptions.
