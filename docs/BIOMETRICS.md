# SmartAttend — Biometrics & Hardware Architecture

This document describes the computer vision algorithms, liveness protection, template extraction, and fingerprint hardware integrations implemented in SmartAttend.

---

## 1. Face Recognition Microservice Architecture

The Face Recognition system is decoupled into a dedicated Python service (`services/face-recognition`) running on port `8001`. It accepts base64-encoded image frames from the school kiosk, processes them with computer vision algorithms, and emits verified student identifiers with confidence scores.

### Pipeline Overview
```text
[Camera Capture Frame]
         │
         ▼
[1. Quality Validation]
  ├── Brightness Check (mean pixel value ∈ [40, 220])
  └── Sharpness / Focus (Laplacian Variance > 100.0)
         │
         ▼
[2. Face Detection & Alignment]
  ├── OpenCV Haar / DNN Face Detector
  └── Eye pupil landmark localization & bounding box normalization
         │
         ▼
[3. Presentation Attack Detection (Liveness)]
  ├── Texture Frequency Analysis (Moire pattern & screen reflection check)
  └── Multi-frame Motion / Eye-blink Delta
         │
         ▼
[4. Feature Vector Extraction]
  └── 128-d / 512-d normalized floating-point embedding vector
         │
         ▼
[5. Vector Cosine Distance Matching]
  └── Search against school's enrolled student vector vault
         │
         ▼
[Verified Student ID + Confidence Score + Liveness Flag]
```

### Quality Scoring Metrics
1. **Illumination (30%)**: Checks that the subject is neither backlit nor severely underexposed.
2. **Sharpness (40%)**: Calculated using the variance of the Laplacian:
   $$\text{Var}(\nabla^2 I) > 100$$
3. **Face Scale (30%)**: The bounding box must occupy at least 15% of the frame width and height to prevent distant, low-resolution recognition errors.

### Liveness & Anti-Spoofing
To prevent presentation attacks (e.g. holding up a photo or tablet):
- **High-Frequency Texture Residual**: Screen photos exhibit characteristic grid patterns and pixel grid artifacts analyzed via fast Fourier / Laplacian filter gradients.
- **Micro-movement / Eye-Blink**: Multiple consecutive frames verify natural head micro-jitter and pupil dilation.

---

## 2. Fingerprint Terminal Hardware Integration

The Biometric Device Bridge (`services/device-bridge`) provides an abstraction layer between vendor SDKs and the SmartAttend backend.

### Supported Terminal Families

| Manufacturer | Protocols / SDK | Compatibility | Notes |
|---|---|---|---|
| **ZKTeco** (e.g. K40, SilkID, UFace800) | Standalone SDK / TCP port `4370` | Native Network Adapter | Listens for real-time push logs via ZK Pull/Push protocol |
| **Mantra** (e.g. MFS100) | Mantra RD Service (HTTP `11100`) | USB Local Agent | Compatible with Indian UIDAI Aadhaar standard hardware |
| **SecuGen** (Hamster Pro 20) | FDx SDK Pro / Web API | USB Local Agent | High-durability optical sensor for harsh school environments |
| **Morpho / Idemia** (MSO 1300) | MorphoSmart SDK / MSO Client | USB Local Agent | Optical scanner with fake finger detection |

### Device Bridge Modes
Configure via `DEVICE_BRIDGE_MODE` in `.env`:
1. **`hardware`**: Connects directly to hardware terminal IP addresses or USB RD Services.
2. **`simulator`**: High-fidelity developer simulator emitting synthetic events with explicit `verification_method: SIMULATED` metadata.

---

## 3. Privacy & Biometric Data Security

1. **No Raw Biometric Storage**: SmartAttend never stores raw biometric images (faces, fingerprints) in standard database tables.
2. **One-Way Feature Hashing**: Feature embeddings are isolated in the biometric vault, with a SHA-256 fingerprint hash stored in Supabase for integrity verification.
3. **Revocation & Consent**: Parents and school authorities can revoke biometric consent at any time via the Student Management UI, immediately scrubbing templates from the microservice memory and database.
